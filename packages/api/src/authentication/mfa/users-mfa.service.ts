import { throw400, throw401, throw403, throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, OtpEnableDto, Role, RoleCollection, SignInDto } from "@zmaj-js/common"
import { isString } from "radash"
import { z } from "zod"
import { MfaService } from "./mfa.service"
import { RequestMfaPrompt } from "./request-mfa-prompt.type"

const OtpJwtSchema = z.object({
	email: z.string().email(),
	secret: z.string(),
	purpose: z.literal("enable-mfa"),
})

@Injectable()
export class UsersMfaService {
	roleRepo: OrmRepository<Role>
	constructor(
		private readonly usersService: UsersService,
		private readonly jwt: JwtService,
		private readonly mfa: MfaService,
		private readonly repoManager: RepoManager,
	) {
		this.roleRepo = this.repoManager.getRepo(RoleCollection)
	}

	async requestToEnableOtp(userId: string): Promise<RequestMfaPrompt> {
		const user = await this.usersService.findUserWithHiddenFields({ id: userId })
		if (user?.status !== "active") throw403(764832, emsg.accountDisabled)
		// this.usersService.ensureUserIsActive(dbUser)
		if (isString(user!.otpToken)) throw403(738993, emsg.mfaDisabled)
		return this.mfa.generateParamsToEnable(user.email)
	}

	async enableOtp({ jwt, code }: OtpEnableDto): Promise<void> {
		const jwtData = await this.jwt.verifyAsync(jwt).catch((e: Error) => {
			if (e.message.includes("expired")) throw401(43973, emsg.mfaEmailExpired)
			throw500(35823)
		})
		const { email, secret } = OtpJwtSchema.parse(jwtData)

		const dbUser = await this.usersService.findActiveUser({ email })
		if (dbUser.otpToken) throw403(90324, emsg.mfaEnabled)
		const valid = await this.mfa.checkMfa(secret, code)
		if (!valid) throw400(84923, emsg.mfaInvalid)
		const otpToken = await this.mfa.encryptSecret(secret)
		await this.usersService.repo.updateById({ id: dbUser.id, changes: { otpToken } })
	}

	async disableOtp(authUser: AuthUser, password: string): Promise<void> {
		const validPassword = await this.usersService.checkPassword({
			userId: authUser.userId,
			password,
		})
		if (!validPassword) throw400(789993, emsg.invalidPassword)
		const user = await this.usersService.findActiveUser({ id: authUser.userId })
		if (user.otpToken === null) throw400(789933, emsg.mfaDisabled)
		await this.usersService.repo.updateById({ id: authUser.userId, changes: { otpToken: null } })
	}

	async hasMfa(
		data: SignInDto,
		trx?: Transaction,
	): Promise<{ enabled: boolean; required: boolean }> {
		const user = await this.usersService.findUserWithHiddenFields({ email: data.email }, trx)
		if (!user) throw400(379997, emsg.invalidEmailOrPassword)

		const valid = await this.usersService.checkPasswordHash(user.password, data.password.trim())
		if (!valid) throw400(97783, emsg.invalidEmailOrPassword)
		if (user.status !== "active") throw403(738429, emsg.accountDisabled)
		// this.usersService.ensureUserIsActive(user)
		const requireMfa = await this.isMfaRequired(user.roleId)

		return {
			enabled: isString(user.otpToken),
			required: requireMfa,
		}
	}

	async authUserHasMfa(authUser: AuthUser): Promise<boolean> {
		const user = await this.usersService.findUserWithHiddenFields({ email: authUser.email })
		if (!user) throw400(379997, emsg.authRequired)

		return isString(user.otpToken)
	}

	async isMfaRequired(roleId: string): Promise<boolean> {
		const role = await this.roleRepo.findById({ id: roleId })
		return role.requireMfa ?? false
	}
}
