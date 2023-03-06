import { GlobalConfig, GlobalConfigParams } from "@api/app/global-app.config"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import argon2 from "argon2"
import { beforeEach, describe, expect, it } from "vitest"
import { EncryptionService } from "./encryption.service"

/* cSpell:disable */
const rawValue = "string 123!!"

const encryptedValue =
	"$ZM$8e6305be7279965b397ce0890a4a954e227fe541d018fa755b5adedd4c3316a8f949c52dd7ed4e7b9e69ae9bae980ad3d7784add697ec2a651198f4f864d9c8ab07f4250d2e428c69374cc16850aa383d855fb3343d3e7a4564aacc639a38b29c16fd178952e7800f1f1ac0a"

const rawValue2 = [
	"Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
	"Consequuntur ipsa aperiam doloremque alias mollitia quis!",
	"Delectus laudantium deserunt facere ipsam repellendus!",
	"Eaque culpa quae possimus?",
].join(" ")

const encryptedValue2 =
	"$ZM$edcf56f72e3f14f0f7209004035b1bea818ff1474c1896be4717b3fcfdb10adda908d9cc4d132ed333d9b44239431f30458c2cc2a3864667cca4172f6e8f5b589cbd455188d4dbe1eabb95bf9d8425da549da0815a8225bbb8217452338744e73eb8eaf9643701e1e9690509d7b54aba8bbc93aada9fdbd4013a3273b87adb87491576992ec859d0a32b3454c06afe2dcf14db1d02830fd9dbfaea4d8938e8ab58d68f58bad4171fce790f944333c0d19d12911feaf057688cd7759b9d50ea47e70d74b135a525dd998f7ec69f5ba185612ceeb8bf35f91bebf2ff6b811a12206a1d9c47ca9f45d256877c054229e92653e075054d2356b5392830f3be66616b0266fe7a2c93e4309e99a21dee10e52e7b7fafdce3bd310026d666b424f7d424ac09cc7def"
/* cSpell:enable */

describe("EncryptionService", () => {
	let service: EncryptionService

	beforeEach(async () => {
		service = new EncryptionService({
			secretKey: "my-testing-secret-key-value",
		} as GlobalConfigParams as GlobalConfig)
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
			"$ZM$dbf991ab79cfefd6bd1f00cd4f2b6c7465cf052e9cafd4762a76461b3f607d9fcb03d9f5afadb167d83c05fee85c6f22d3fd39f93f81999553215b04d4b78791b3d57ad42fc26816d4190d6e07e95488560675204ef7ddb96bff4f1f861d5ec0c5261ba49611c49c676b7dd22327f8c85a3d6c4f5fcf813ac1a78c342114ce15de2fa9cb17a542c12f6d2fe52dd21ad8fef587f631bd8d0fe82d5130587da05d21e57512725fc677f3059340c729729138d78c23a859718fe0c8a4e129bd222c"

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
