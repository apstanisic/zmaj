import { GlobalConfig, GlobalConfigParams } from "@api/app/global-app.config"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import argon2 from "argon2"
import { beforeEach, describe, expect, it } from "vitest"
import { EncryptionService } from "./encryption.service"

/* cSpell:disable */
const rawValue = "string 123!!"

const encryptedValue =
	"$ZM$%2d55b5f89ad07799132c0798310708025cf6165871b799136b0637c69043a0a8ffc951e722bafde9cf8397260ca6e14bf90737a89593fa9cbe5f1c8b575f8178fe515900d217246689736e61e18372ed6abc4904bcac6da5e3f3067e57966fd70d4e7836394ec0ceb9cde339"

const rawValue2 = [
	"Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
	"Consequuntur ipsa aperiam doloremque alias mollitia quis!",
	"Delectus laudantium deserunt facere ipsam repellendus!",
	"Eaque culpa quae possimus?",
].join(" ")

const encryptedValue2 =
	"$ZM$%80adf661bf973e0ebee9f687ab55e3529b52e15dc53334357320168c01aa0387f9cca14e665a9c6dc1ef8172985599570b7d134512886ebd741ee10752b8061b596310e085d8cda573d9ad7fc5444dcb8baeb8ee5397681f3ff25a94dad8e1edace4775c11bfefe959c7dfe6a552d93b4d3c1501c0169c9f2906586c120dd544d942bbbe37b31bbd81ab26d453daff83a1b9bbaf1b7a208a543a470c84a62bef11dc1b4be64d9f44b8f7f41be1c91f9c2fee35ebfe8d72082bcd297f5d77cb6210b9badc352259b33fef7c51d315f582686403f1cceb5d90a3427d9c4d5b5a2175de7656559a21ac56d35409deae0daa429b1652aac1f9517a7b047088df16c33822eb7f2ad8e12b4614d8b396a61322db798acac3b277a9d3a6d6087df77c9a134594004a"
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
			"$ZM$%34a2f1d03d6bfbff12bb4de1c3079477793c1708fd0604cf32030a888748723870c32634e1fc012ba411f3b08873bd9b6d025adeeecaf502f2008c0a20caf51c83825ee9552d1e02ff0b260d375ed553f9be6705cc81801eed90bc2b9a3f0923dd32fda28408a1ca410e64b6cf0a1999efc5b55910cad7b1d762e754edddc38dd1f7120e8aaab5b41ce35ef83864fb822395687350103033c5db9c7f1730b5f7a957cb513fb52a2979f7ad4188b54844462a1e7643a6124ec459b6e3cdf66b0e"

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
