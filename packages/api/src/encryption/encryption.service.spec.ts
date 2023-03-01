import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import argon2 from "argon2"
import { beforeEach, describe, expect, it } from "vitest"
import { EncryptionService } from "./encryption.service"

/* cSpell:disable */
const rawValue = "string 123!!"

const encryptedValue = "E$N$C$71cee0269333dfa3:b474ac3c6c9e5ca5a7a9eab3bf1bccbc"

const rawValue2 = [
	"Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
	"Consequuntur ipsa aperiam doloremque alias mollitia quis!",
	"Delectus laudantium deserunt facere ipsam repellendus!",
	"Eaque culpa quae possimus?",
].join(" ")

const encryptedValue2 =
	"E$N$C$a8e1eba4e2b542f8:e024776b7cb92d3a98307af17570353ad40f67ecf28cf970e35ffd0f563f5a147d265530ecf48dd062f2a56fb424a8f0b2b197c1953555e7b0ba0acccc5fcd2d707f1688d977735676055f027648df4567cddb0f682bd4f6c2b7dc261ec52571cef7ee6294022b4ae32f21a2e8e6af925028cb10642b46a44728f3fe90902af3c02b0117ad9cd570ac5cc501eeab152a7c1676de96c1df92a75a2dfc87d3b8a259a927cc98b9d294022196dabc8be58d6f13dbc4aac0eefd73d97faefa6a40dc40fb697ea9bd193ede9ef1cb8889c81a"
/* cSpell:enable */

describe("EncryptionService", () => {
	let service: EncryptionService

	beforeEach(async () => {
		const module = await buildTestModule(EncryptionService).compile()

		service = module.get(EncryptionService)

		service["config"].secretKey = "super-secret-key-of-20+-length"
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(EncryptionService)
	})

	/**
	 *
	 */
	describe("encrypt", () => {
		it("should encrypt value", async () => {
			const enc = await service.encrypt(rawValue)
			expect(enc).not.toEqual(rawValue)

			const decrypted = await service.decrypt(enc)
			expect(decrypted).toEqual(rawValue)
		})

		it("should work with many different lengths", async () => {
			const enc = await service.encrypt(rawValue2)
			expect(enc).not.toEqual(rawValue2)

			const decrypted = await service.decrypt(enc)
			expect(decrypted).toEqual(rawValue2)
		})

		it("should not output same encrypted value twice for same string", async () => {
			const enc1 = await service.encrypt(rawValue)
			const enc2 = await service.encrypt(rawValue)

			expect(enc1).not.toEqual(enc2)
			expect(enc1).not.toEqual(encryptedValue)
		})

		it("should throw if value is not string", async () => {
			await expect(service.encrypt(44 as never)).rejects.toThrowError(BadRequestException)
		})
	})

	/**
	 *
	 */
	describe("decrypt", () => {
		it("should decryptNative value", async () => {
			const enc = await service.decrypt(encryptedValue)

			expect(enc).toEqual(rawValue)
		})

		it("should work with many different lengths", async () => {
			const enc = await service.decrypt(encryptedValue2)

			expect(enc).toEqual(rawValue2)
		})

		it("should throw if value is not string", async () => {
			await expect(service.decrypt(44 as never)).rejects.toThrowError(InternalServerErrorException)
		})

		it("should throw if value is not valid", async () => {
			const withoutFirstChar = encryptedValue.slice(1)
			// this is because without first char, it won't have valid prefix
			await expect(service.decrypt(withoutFirstChar)).rejects.toThrowError(BadRequestException)

			const withoutLastChar = encryptedValue.slice(0, -1)
			await expect(service.decrypt(withoutLastChar)).rejects.toThrowError(
				InternalServerErrorException,
			)
		})
	})

	/**
	 *
	 */
	describe("hash", () => {
		// let hashSpy = vi.spyOn(argon2, "hash")

		// beforeEach(() => {
		// 	hashSpy = vi.spyOn(argon2, "hash")
		// })

		it("should pepper hashed password", async () => {
			const res = await service.hash("hello_world")
			expect(res.startsWith(service.prefix)).toEqual(true)
		})

		it("should not pepper hashed password if specified", async () => {
			const res = await service.hash("hello_world", { encrypt: false })
			expect(res.startsWith(service.prefix)).toEqual(false)
		})

		it("should hash password with argon2id", async () => {
			const res = await service.hash("hello_world")
			const decrypted = await service.decrypt(res)
			expect(decrypted.startsWith("$argon2id")).toEqual(true)
		})

		it("should hash password with argon2id", async () => {
			const res = await service.hash("hello_world")
			const decrypted = await service.decrypt(res)
			const hashValid = await argon2.verify(decrypted, "hello_world", { type: argon2.argon2id })
			expect(hashValid).toEqual(true)
		})
	})

	/**
	 *
	 */
	describe("verify", () => {
		/* cSpell:disable */
		const hashWithPepper =
			"E$N$C$8ce57d822ee574f3:72e013d323b827adac42e7b27ce33dbb58662ec277fc849223739639dcde802bef5748b7614f932d60346e27c946ce50f5d98242061b78bc01651d62ad88da30c72a161cebea0ed5da14b5225a201d331a1d6eab3aa65a29c6425d7b39c4f0d5616a6d1ede511027bdcc5d7da2b8caa9"

		const onlyHash =
			"$argon2id$v=19$m=4096,t=3,p=1$ewb7BX95IU8hkM4vPbGUlA$uSwzFmxyUs3ULYbY0SGppjqVRC/TvlZffolPsthELLc"
		/* cSpell:enable */

		it("should verify argon hash with pepper", async () => {
			const valid = await service.verifyHash(hashWithPepper, "hello_world")
			expect(valid).toEqual(true)
		})

		it("should verify argon hash without pepper", async () => {
			const valid = await service.verifyHash(onlyHash, "hello_world")
			expect(valid).toEqual(true)
		})

		it("should throw if hash is in invalid format", async () => {
			await expect(service.verifyHash("some_invalid_format", "hello_world")).rejects.toThrowError(
				InternalServerErrorException,
			)
		})
	})
})
