import { GlobalConfig } from "@api/app/global-app.config"
import { throw400 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { createHash } from "crypto"
import { authenticator as otpAuth } from "otplib"
import { toDataURL } from "qrcode"
import { EncryptionService } from "../../encryption/encryption.service"
import { RequestMfaPrompt } from "./request-mfa-prompt.type"

@Injectable()
export class MfaService {
	readonly backupCodeLength = 14

	constructor(
		private globalConfig: GlobalConfig,
		private encryption: EncryptionService,
		private jwt: JwtService,
	) {}

	private generateSecret(): string {
		return otpAuth.generateSecret()
	}
	private async generateQrCode(email: string, secret: string): Promise<string> {
		const image = await toDataURL(otpAuth.keyuri(email, this.globalConfig.name, secret))
		return image
	}

	async generateParamsToEnable(email: string): Promise<RequestMfaPrompt> {
		const secret = this.generateSecret()
		const image = await this.generateQrCode(email, secret)
		// With this we are sure that we provided params, and expiration
		const jwt = await this.jwt.signAsync(
			{ purpose: "enable-mfa", email, secret },
			{ expiresIn: 300 },
		)
		const backupCodes = await this.calculateBackupCodes(secret)
		return { image, secret, jwt, backupCodes }
	}

	private async decryptSecret(secret: string): Promise<string> {
		return this.encryption.decryptIfEncrypted(secret)
	}

	private async check6DigitCode(secret: string, code: string): Promise<boolean> {
		// supports both encrypted and non encrypted mfa secrets
		secret = await this.decryptSecret(secret)
		return otpAuth.verify({ secret, token: code })
	}
	private async checkBackupCode(secret: string, backupCode: string): Promise<boolean> {
		const codes = await this.calculateBackupCodes(secret)
		return codes.includes(backupCode.trim())
	}

	async checkMfa(secret: string, code: string): Promise<boolean> {
		if (code.length === 6) return this.check6DigitCode(secret, code)
		if (code.length === this.backupCodeLength) return this.checkBackupCode(secret, code)
		throw400(793755, emsg.mfaInvalid)
	}

	async encryptSecret(secret: string): Promise<string> {
		return this.encryption.encrypt(secret)
	}

	async calculateBackupCodes(secret: string): Promise<string[]> {
		secret = await this.decryptSecret(secret)
		const hash = createHash("sha256").update(secret, "utf8").digest("hex")
		const chars = hash.split("")
		const codes: string[] = []

		// max 4 backup codes, and every code must be at least 14 chars
		while (chars.length > this.backupCodeLength && codes.length < 4) {
			const item = chars.splice(0, this.backupCodeLength)
			codes.push(item.join(""))
		}
		return codes
	}
}
