import { throw400, throw401, throw403, throw500 } from "@api/common/throw-http"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { AuthUser, SignInDto } from "@zmaj-js/common"
import { get, isString } from "radash"
import { MfaService } from "./mfa.service"

@Injectable()
export class UsersMfaService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwt: JwtService,
		private readonly mfa: MfaService,
	) {}

	async requestToEnableOtp(
		user: AuthUser,
	): Promise<{ image: string; secret: string; jwt: string; backupCodes: string[] }> {
		const dbUser = await this.usersService.getUserWithHiddenFields({ id: user.userId })
		if (dbUser?.status !== "active") throw403(764832, emsg.accountDisabled)
		// this.usersService.ensureUserIsActive(dbUser)
		if (isString(dbUser!.otpToken)) throw403(738993, emsg.mfaDisabled)
		const secret = this.mfa.generateSecret()
		const image = await this.mfa.generateQrCode(user.email, secret)
		const jwt = await this.jwt.signAsync({ secret }, { expiresIn: 300 })
		const backupCodes = await this.mfa.calculateBackupCodes(secret)
		// await this.usersService.repo.updateById({ id: user.userId, changes: { otpToken: secret } })
		// secret should be non encrypted, since user has to save it
		return { image, secret, jwt, backupCodes }
	}

	async enableOtp({
		jwt,
		code,
		user,
	}: {
		jwt: string
		code: string
		user: AuthUser
	}): Promise<void> {
		const dbUser = await this.usersService.findActiveUser({ id: user.userId })
		if (dbUser.otpToken) throw403(90324, emsg.mfaEnabled)
		const res = await this.jwt.verifyAsync(jwt).catch((e: Error) => {
			if (e.message.includes("expired")) throw401(43973, emsg.mfaEmailExpired)
			throw500(35823)
		})
		const secret = get<unknown, unknown>(res, "secret", null)
		if (!isString(secret)) throw400(898933, emsg.invalidPayload)
		const valid = await this.mfa.check(secret, code)
		if (!valid) throw400(84923, emsg.mfaInvalid)
		const otpToken = await this.mfa.encryptSecret(secret)
		await this.usersService.repo.updateById({ id: user.userId, changes: { otpToken } })
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

	async hasMfa(data: SignInDto, trx?: Transaction): Promise<boolean> {
		const user = await this.usersService.getUserWithHiddenFields({ email: data.email }, trx)
		if (!user) throw400(379997, emsg.invalidEmailOrPassword)

		const valid = await this.usersService.checkPasswordHash(user.password, data.password.trim())
		if (!valid) throw400(97783, emsg.invalidEmailOrPassword)
		if (user.status !== "active") throw403(738429, emsg.accountDisabled)
		// this.usersService.ensureUserIsActive(user)

		return isString(user.otpToken)
	}

	async authUserHasMfa(authUser: AuthUser): Promise<boolean> {
		const user = await this.usersService.getUserWithHiddenFields({ email: authUser.email })
		if (!user) throw400(379997, emsg.authRequired)

		return isString(user.otpToken)
	}
}
