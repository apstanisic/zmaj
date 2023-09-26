import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { throw400, throw401, throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, SignInDto, SignInResponse, UserWithSecret, isEmail } from "@zmaj-js/common"
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

	/**
	 * Logout user
	 * @param refreshToken Refresh token
	 */
	async signOut(refreshToken: string): Promise<void> {
		await this.sessionsService.removeByRefreshToken(refreshToken)
	}

	async emailAndPasswordSignIn(
		dto: SignInDto,
		params: Pick<CrudRequest, "ip" | "userAgent"> & { expiresAt?: Date },
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
		const requireMfa = await this.authzService.roleRequireMfa(AuthUser.fromUser(user))
		if (requireMfa && !user.otpToken) {
			return { status: "must-create-mfa", data: await this.mfa.generateParamsToEnable(dto.email) }
		}
		// sign in user
		const authUser = AuthUser.fromUser(user)
		const tokens = await this.createAuthSession(authUser, params)
		return { status: "signed-in", ...tokens, user: authUser }
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
	 * This is used for magic link login, and SSO (oauth and oidc)
	 */
	async createAuthSession(
		user: AuthUser,
		params: Pick<CrudRequest, "ip" | "userAgent"> & { expiresAt?: Date },
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
}
