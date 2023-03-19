import { AuthorizationService } from "@api/authorization/authorization.service"
import { AuthorizationState } from "@api/authorization/authorization.state"
import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { throw400, throw401, throw403 } from "@api/common/throw-http"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, isEmail, SignInDto, SignInResponse, User, UserWithSecret } from "@zmaj-js/common"
import { isString } from "radash"
import { v4 } from "uuid"
import { AuthSessionsService } from "./auth-sessions/auth-sessions.service"
import { AuthenticationConfig } from "./authentication.config"
import { MfaService } from "./mfa/mfa.service"
import { SignUpService } from "./sign-up/sign-up.service"

/** Auth Tokens */
export type AuthTokens = { accessToken: string; refreshToken: string }
/** Params for OAuth login */
export type OAuthLoginParams = {
	email: string
	emailVerified: boolean
	firstName?: string
	lastName?: string
	photoUrl?: string
}

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly users: UsersService,
		private readonly sessionsService: AuthSessionsService,
		private readonly jwtService: JwtService,
		private readonly signUpService: SignUpService,
		private readonly authnConfig: AuthenticationConfig,
		private readonly mfa: MfaService,
		private readonly authzService: AuthorizationService,
	) {}

	async signIn2(
		dto: SignInDto,
		meta: Pick<CrudRequest, "ip" | "userAgent">,
	): Promise<SignInResponse> {
		const user = await this.users.findUserWithHiddenFields({ email: dto.email })
		// user does not exist
		if (!user) throw401(68833, emsg.userNotFound)
		// not active
		if (user.status !== "active") throw403(59391, emsg.accountDisabled)
		// check password
		const validPassword = await this.users.checkPasswordHash(user.password, dto.password)
		if (!validPassword) throw400(69333, emsg.invalidEmailOrPassword)
		// check if mfa token is missing
		if (user.otpToken && !isString(dto.otpToken)) return { status: "has-mfa" }
		// verify mfa if exists
		await this.verifyOtp(user, dto.otpToken)
		// check if role requires mfa
		if (this.authzService.roleRequireMfa(user.roleId) && !user.otpToken) {
			return { status: "must-create-mfa", data: await this.mfa.generateParamsToEnable(dto.email) }
		}
		// sign in user
		const tokens = await this.signInWithoutPassword(AuthUser.fromUser(user), meta)
		return { status: "success", ...tokens }
	}
	/**
	 * Try to login with email and password.
	 */
	async signInWithPassword(
		dto: SignInDto,
		meta: Pick<CrudRequest, "ip" | "userAgent">,
	): Promise<AuthTokens> {
		this.users.findActiveUser
		const user = await this.getSignInUser(dto)
		const authUser = AuthUser.fromUser(user)

		// it uses config from JwtModule
		const accessToken = await this.jwtService.signAsync(authUser.stripJwtData())
		const refreshToken = await this.sessionsService.createSession(authUser, meta)

		return { accessToken, refreshToken }
	}

	/**
	 * Logout user
	 * @param refreshToken Refresh token
	 */
	async signOut(refreshToken: string): Promise<void> {
		await this.sessionsService.removeByRefreshToken(refreshToken)
	}

	/**
	 * Get new access token
	 * @param refreshToken
	 * @returns new access token
	 */
	async getNewAccessToken(refreshToken?: string): Promise<string> {
		if (!refreshToken) throw401(51054, emsg.rtNotProvided)
		const session = await this.sessionsService.extendSessionValidity(refreshToken)
		const user = await this.users.findUser({ id: session.userId })

		// db is cascade deleting sessions after user is deleted, so we are sure user exist
		const authUser = AuthUser.fromUser(user!).stripJwtData()
		const accessToken = await this.jwtService.signAsync(authUser)
		return accessToken
	}

	/**
	 * Check if email and password are valid
	 * Used for standard login and for basic auth
	 * @returns User that is has valid credentials, otherwise throw
	 * @throws If there is any problem (bad email, bad password, expired password, account not active...)
	 */
	async getUserByEmailAndPassword(email: string, password: string): Promise<User> {
		const user = await this.users.findActiveUser({ email })

		// password must be valid
		const valid = await this.users.checkPassword({ userId: user.id, password })
		if (!valid) throw401(18921, emsg.invalidEmailOrPassword)

		// password must not be expired
		// if (user.passwordExpiresAt && isPast(user.passwordExpiresAt)) throw403(982772)

		return user
	}

	/**
	 * This is used for magic link login, and SSO (oauth and oidc)
	 */
	// params: CreateAuthSessionParams
	async signInWithoutPassword(
		user: AuthUser,
		params: Pick<CrudRequest, "ip" | "userAgent">,
	): Promise<AuthTokens> {
		const refreshToken = await this.sessionsService.createSession(user, params)
		const accessToken = await this.getNewAccessToken(refreshToken)
		return { refreshToken, accessToken }
	}

	/**
	 * Login user that used OAuth
	 * If user does not have account, it will try to create it for them
	 */
	async oauthSignIn(params: OAuthLoginParams): Promise<AuthUser> {
		const { email, emailVerified, firstName, lastName, photoUrl } = params

		if (!isEmail(email)) throw400(395491, emsg.notEmail(email))
		if (emailVerified !== true) throw403(819672, emsg.emailUnconfirmed)

		const user = await this.users.findActiveUser({ email })

		// Local account exists,  simply log in user. It will be logged in in controller
		if (user) {
			const authUser = AuthUser.fromUser(user)
			// this.authzService.checkSystem("auth", "oauthLogin", { user: authUser }) || throw403(1723629)
			return authUser
		}

		if (!this.authnConfig.allowOAuthSignUp) throw403(499923, emsg.oauthSignUpDisabled)
		// this.authz.checkSystem("account", "oauthLogin", { user })
		// Try to create account. Random password will be generated  (uuid) so no one will know
		// it will throw if sign up is not allowed
		const newUser = await this.signUpService.signUp(
			{ email, firstName, lastName, password: v4() },
			{ confirmedEmail: true, status: "active" },
		)
		return AuthUser.fromUser(newUser)
	}

	async verifyOtp(user: UserWithSecret, code?: string | null): Promise<void> {
		if (user.otpToken === null) return

		const validOtp = await this.mfa.checkMfa(user.otpToken, code ?? "invalid")
		if (!validOtp) throw401(388532, emsg.mfaInvalid)
	}

	async getSignInUser(data: SignInDto, trx?: Transaction): Promise<User> {
		const user = await this.users.findUserWithHiddenFields({ email: data.email }, trx)
		if (user?.status !== "active") throw403(7389999, emsg.accountDisabled)
		// user = this.users.ensureUserIsActive(user)

		const valid = await this.users.checkPasswordHash(user.password, data.password.trim())
		if (!valid) throw401(189251, emsg.invalidEmailOrPassword)

		await this.verifyOtp(user, data.otpToken)

		if (user.otpToken === null && this.authzService.roleRequireMfa(user.roleId)) {
			throw403(499551, emsg.mfaDisabled)
		}

		const { password, otpToken, ...allowedData } = user
		return allowedData
	}
}
