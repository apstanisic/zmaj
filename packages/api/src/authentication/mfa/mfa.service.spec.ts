import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { authenticator } from "otplib"
import { toDataURL } from "qrcode"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EncryptionService } from "../../encryption/encryption.service"
import { MfaService } from "./mfa.service"

vi.mock("otplib", () => ({
	authenticator: {
		verify: vi.fn(() => true),
		generateSecret: vi.fn(() => "secret1111"),
		keyuri: vi.fn(() => "http://example.com"),
	},
}))

vi.mock("qrcode", () => ({
	toDataURL: vi.fn(async () => "img"),
}))

describe("MfaService", () => {
	let service: MfaService
	let encService: EncryptionService
	beforeEach(async () => {
		const module = await buildTestModule(MfaService).compile()
		service = module.get(MfaService)
		encService = module.get(EncryptionService)
		encService.encrypt = vi.fn(async () => "enc")
		encService.decrypt = vi.fn(async (v) => v.substring(4))
		// @ts-expect-error
		encService.prefix = "ENC$"
	})
	describe("check", () => {
		it("should check encrypted", async () => {
			//
			const res = await service.check("ENC$someEnc", "123456")
			expect(encService.decrypt).toBeCalledWith("ENC$someEnc")

			expect(res).toEqual(true)
			expect(authenticator.verify).toBeCalledWith({ secret: "someEnc", token: "123456" })
		})
		it("should check non encrypted", async () => {
			const res = await service.check("plain", "123456")
			expect(res).toEqual(true)
			expect(authenticator.verify).toBeCalledWith({ secret: "plain", token: "123456" })
		})
	})

	describe("checkAll", () => {
		beforeEach(() => {
			service.check = vi.fn(async () => true)
			service.checkBackupCode = vi.fn(async () => true)
		})
		it("should check 6 digit code", async () => {
			const res = await service.checkAll("hello", "123456")
			expect(res).toEqual(true)
			expect(service.check).toBeCalledWith("hello", "123456")
			expect(service.checkBackupCode).not.toBeCalled()
		})

		it("should check backup code", async () => {
			const res = await service.checkAll("hello", "12345678901234")
			expect(res).toEqual(true)
			expect(service.checkBackupCode).toBeCalledWith("hello", "12345678901234")
			expect(service.check).not.toBeCalled()
		})

		it("should throw if invalid length", async () => {
			await expect(service.checkAll("hello", "12345678")).rejects.toThrow(BadRequestException)
		})
	})
	describe("encryptSecret", () => {
		it("should encrypt secret", async () => {
			const res = await service.encryptSecret("hello")
			expect(res).toEqual("enc")
			expect(encService.encrypt).toBeCalledWith("hello")
		})
	})
	describe("generateSecret", () => {
		it("should encrypt secret", async () => {
			const res = service.generateSecret()
			expect(res).toEqual("secret1111")
		})
		//
	})

	describe("generateQrCode", () => {
		it("should generate qr code", async () => {
			const res = await service.generateQrCode("hello@world.com", "secret2222")
			expect(res).toEqual("img")
			expect(authenticator.keyuri).toBeCalledWith("hello@world.com", "Zmaj App", "secret2222")
			expect(toDataURL).toBeCalledWith("http://example.com")
		})
	})

	describe("calculateBackupCode", () => {
		// values are manually provided
		it("should calculate backup codes", async () => {
			const secret = "DEAGYKSYJUCG4JZI"
			const res = await service.calculateBackupCodes(secret)
			expect(res).toEqual([
				"53d8e7f2b7598d", //
				"6faec57f4afb59",
				"d70ef240d9b4e0",
				"d95eee3a7e30c0",
			])
		})
	})

	describe("checkBackupCode", () => {
		// values are manually provided
		it("should check if backup code is valid", async () => {
			const secret = "DEAGYKSYJUCG4JZI"
			const valid = await service.checkBackupCode(secret, "53d8e7f2b7598d")
			expect(valid).toEqual(true)

			const invalid = await service.checkBackupCode(secret, "53d8e7f2b7598p")
			expect(invalid).toEqual(false)
		})
	})

	describe("getPlainSecret", () => {
		it("should return provided value if not encrypted", async () => {
			//
			const res = await service["getPlainSecret"]("non_enc")
			expect(res).toEqual("non_enc")
		})
		it("should return provided value if not encrypted", async () => {
			const res = await service["getPlainSecret"]("ENC$hello")
			expect(res).toEqual("hello")
			//
		})
	})
})
