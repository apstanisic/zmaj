import { throw400, throw401, throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, OtpEnableDto, RoleModel } from "@zmaj-js/common"
import { Orm, OrmRepository, Transaction } from "@zmaj-js/orm"
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
	roleRepo: OrmRepository<RoleModel>
	constructor(
		private readonly usersService: UsersService,
		private readonly jwt: JwtService,
		private readonly mfa: MfaService,
		private readonly orm: Orm,
	) {
		this.roleRepo = this.orm.getRepo(RoleModel)
	}

	async requestToEnableOtp(userId: string): Promise<RequestMfaPrompt> {
		const user = await this.usersService.findUserWithHiddenFields({ id: userId })
		if (user?.status !== "active") throw403(764832, emsg.accountDisabled)
		// this.usersService.ensureUserIsActive(dbUser)
		if (isString(user!.otpToken)) throw403(738993, emsg.mfaEnabled)
		return this.mfa.generateParamsToEnable(user.email)
	}

	async enableOtp({ jwt, code }: OtpEnableDto): Promise<void> {
		const jwtData = await this.jwt.verifyAsync(jwt).catch((e: Error) => {
			if (e.message.includes("expired")) throw401(43973, emsg.mfaEmailExpired)
			throw500(35823)
		})
		const parseResult = OtpJwtSchema.safeParse(jwtData)
		if (!parseResult.success) throw400(547899, emsg.invalidPayload)
		const { email, secret } = parseResult.data

		const dbUser = await this.usersService.findActiveUser({ email })
		if (dbUser.otpToken) throw403(90324, emsg.mfaEnabled)
		const valid = await this.mfa.checkMfa(secret, code)
		if (!valid) throw400(84923, emsg.mfaInvalid)
		const otpToken = await this.mfa.encryptSecret(secret)
		await this.usersService.repo.updateById({
			id: dbUser.id,
			changes: { otpToken },
			overrideCanUpdate: true,
		})
	}

	async disableOtp(authUser: AuthUser, password: string): Promise<void> {
		const validPassword = await this.usersService.checkPassword({
			userId: authUser.userId,
			password,
		})
		if (!validPassword) throw400(789993, emsg.invalidPassword)
		const user = await this.usersService.findActiveUser({ id: authUser.userId })
		if (user.otpToken === null) throw400(789933, emsg.mfaDisabled)
		await this.usersService.repo.updateById({
			id: authUser.userId,
			changes: { otpToken: null },
			overrideCanUpdate: true,
		})
	}

	async hasMfa(user: AuthUser, trx?: Transaction): Promise<boolean> {
		const fullUser = await this.usersService.findUserWithHiddenFields(
			{ email: user.email },
			trx,
		)
		return isString(fullUser?.otpToken)
	}
}
