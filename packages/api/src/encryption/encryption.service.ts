import { GlobalConfig } from "@api/app/global-app.config"
import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { PasswordSchema } from "@zmaj-js/common"
import argon2 from "argon2"
import crypto from "crypto"

/**
 * EncryptionService
 *
 * Methods are async, in case we switch to async implementation in the future, it wont
 * be breaking change
 */
@Injectable()
export class EncryptionService {
	readonly prefix = "E$N$C$"

	constructor(private config: GlobalConfig) {}

	/**
	 * 32 char string
	 */
	get #encryptionKey(): Buffer {
		const secretKey = this.config.secretKey
		if (secretKey.length < 20) throw500(792343)
		// ensure that key is 32 chars long, since that is needed length. We will trim chars above
		// that, but append 1s for missing chars. Min secret key length in app is 20 characters
		const encryptionKey = secretKey.substring(0, 32).padEnd(32, "1")
		return Buffer.from(encryptionKey)
	}

	/**
	 * Encrypt string
	 *
	 * Based on:
	 * @see https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb
	 * Updated version
	 * @see https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb?permalink_comment_id=3771967#gistcomment-3771967
	 */
	async encrypt(text: string): Promise<string> {
		if (typeof text !== "string") throw400(18051, emsg.badEncryptionValue)
		// iv is always 16 bytes
		const iv = Buffer.from(crypto.randomBytes(16)).toString("hex").slice(0, 16)

		// we are providing secret key buffer with length of 32 chars (required), and iv from above
		const cipher = crypto.createCipheriv("aes-256-cbc", this.#encryptionKey, iv)
		// encrypt text
		let encrypted = cipher.update(text)
		// mark as done
		encrypted = Buffer.concat([encrypted, cipher.final()])

		// return iv that is in hex format, colon, and encrypted string in hex format
		return this.prefix + iv + ":" + encrypted.toString("hex")
	}

	/**
	 * Decrypt string
	 *
	 * Based on:
	 * @see https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb
	 * Updated version
	 * @see https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb?permalink_comment_id=3771967#gistcomment-3771967
	 */
	async decrypt(encrypted: string): Promise<string> {
		if (typeof encrypted !== "string") throw500(18051)
		if (!encrypted.startsWith(this.prefix)) throw400(7993788, emsg.badEncryptionValue)

		// we need to get iv from encrypted text
		const [ivString, ...textParts] = encrypted.replace(this.prefix, "").split(":")

		try {
			// convert hex iv to binary buffer
			const iv = Buffer.from(ivString!, "binary")
			// we have to join encrypted parts, because we separated them earlier with colon ":"
			const encryptedText = Buffer.from(textParts.join(":"), "hex")

			// we use same secret key, and iv taken from encrypted value
			const decipher = crypto.createDecipheriv("aes-256-cbc", this.#encryptionKey, iv)

			// decipher text
			let decrypted = decipher.update(encryptedText)
			decrypted = Buffer.concat([decrypted, decipher.final()])

			// convert buffer to string
			return decrypted.toString()
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
