import { GlobalConfig } from "@api/app/global-app.config"
import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { PasswordSchema } from "@zmaj-js/common"
import argon2 from "argon2"
import Cryptr from "cryptr"

/**
 * EncryptionService
 *
 * Methods are async, in case we switch to async implementation in the future, it wont
 * be breaking change
 */
@Injectable()
export class EncryptionService {
	readonly prefix = "$ZM$"

	crypt: Cryptr

	constructor(private config: GlobalConfig) {
		this.crypt = new Cryptr(this.config.secretKey)
	}

	/**
	 * Encrypt string
	 */
	async encrypt(text: string): Promise<string> {
		if (typeof text !== "string") throw400(18051, emsg.badEncryptionValue)
		try {
			const result = this.crypt.encrypt(text)
			return this.prefix + result
		} catch (error) {
			throw500(943200)
		}
	}

	async decryptIfEncrypted(val: string): Promise<string> {
		if (val.startsWith(this.prefix)) return this.decrypt(val)
		return val
	}

	/**
	 * Decrypt string
	 */
	async decrypt(encrypted: string): Promise<string> {
		if (typeof encrypted !== "string") throw500(18051)
		if (!encrypted.startsWith(this.prefix)) throw400(7993788, emsg.badEncryptionValue)

		try {
			return this.crypt.decrypt(encrypted.replace(this.prefix, ""))
		} catch (error) {
			throw500(99932)
		}
	}

	/**
	 * Hash password
	 *
	 * This method always uses latest and best support method, since every new password will be
	 * set in the best way possible
	 *
	 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
	 * @param value
	 * @returns argon2 with pepper
	 */
	async hash(
		value: string,
		options: { validate?: boolean; encrypt?: boolean } = {},
	): Promise<string> {
		const { encrypt = true, validate = true } = options

		const password = validate ? PasswordSchema.parse(value) : value

		const hashed = await argon2.hash(password, { type: argon2.argon2id })
		if (!encrypt) return hashed

		const encrypted = await this.encrypt(hashed)
		return encrypted
	}

	/**
	 * Verify password hash
	 * This method support all possible passwords stored in db.
	 *
	 * @todo Maybe throw error if password is valid, but is stored improperly,
	 * so we have to update password.
	 *
	 * @param hash Hashed password with pepper. Also supported without pepper
	 * @param plain Plain text password
	 * @returns Is password valid
	 */
	async verifyHash(hash: string, plain: string): Promise<boolean> {
		if (hash.startsWith(this.prefix)) {
			hash = await this.decrypt(hash)
		}

		if (hash.startsWith("$argon2id")) {
			return argon2.verify(hash, plain, { type: argon2.argon2id })
		}
		// put legacy password hashes here
		else {
			// invalid hash provided
			throw500(7932499)
		}
	}
}
