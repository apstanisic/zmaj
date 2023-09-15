import { GlobalConfig } from "@api/app/global-app.config"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { TestingModule } from "@nestjs/testing"
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
	let module: TestingModule
	let service: MfaService
	let encService: EncryptionService
	beforeEach(async () => {
		module = await buildTestModule(MfaService).compile()
		service = module.get(MfaService)
		encService = module.get(EncryptionService)
		encService.encrypt = vi.fn(async () => "enc")
		encService.decryptIfEncrypted = vi.fn(async (v) => (v.startsWith("$ZM$") ? v.substring(4) : v))
	})
	describe("check", () => {
		it("should check encrypted", async () => {
			//
			const res = await service["check6DigitCode"]("$ZM$someEnc", "123456")
			expect(encService.decryptIfEncrypted).toBeCalledWith("$ZM$someEnc")

			expect(res).toEqual(true)
			expect(authenticator.verify).toBeCalledWith({ secret: "someEnc", token: "123456" })
		})
		it("should check non encrypted", async () => {
			const res = await service["check6DigitCode"]("plain", "123456")
			expect(res).toEqual(true)
			expect(authenticator.verify).toBeCalledWith({ secret: "plain", token: "123456" })
		})
	})

	describe("checkAll", () => {
		beforeEach(() => {
			service["check6DigitCode"] = vi.fn(async () => true)
			service["checkBackupCode"] = vi.fn(async () => true)
		})
		it("should check 6 digit code", async () => {
			const res = await service.checkMfa("hello", "123456")
			expect(res).toEqual(true)
			expect(service["check6DigitCode"]).toBeCalledWith("hello", "123456")
			expect(service["checkBackupCode"]).not.toBeCalled()
		})

		it("should check backup code", async () => {
			const res = await service.checkMfa("hello", "12345678901234")
			expect(res).toEqual(true)
			expect(service["checkBackupCode"]).toBeCalledWith("hello", "12345678901234")
			expect(service["check6DigitCode"]).not.toBeCalled()
		})

		it("should throw if invalid length", async () => {
			await expect(service.checkMfa("hello", "12345678")).rejects.toThrow(BadRequestException)
		})
	})
	describe("encryptSecret", () => {
		it("should encrypt secret", async () => {
			const res = await service.encryptSecret("hello")
			expect(res).toEqual("enc")
			expect(encService.encrypt).toBeCalledWith("hello")
		})
	})

	describe("generateParamsToEnable", () => {
		let jwtService: JwtService

		beforeEach(() => {
			jwtService = module.get(JwtService)
			// TODO
			jwtService.signAsync = vi.fn(async (p) => JSON.stringify(p)) as any

			module.get(GlobalConfig).name = "Hello World"

			service.calculateBackupCodes = vi.fn(async (secret) => [secret[0]!, secret[1]!])
			service["generateSecret"] = vi.fn(() => "Hello")
			service["generateQrCode"] = vi.fn(async (email) => `base64:${email}`)
		})

		it("should create jwt that is valid 5 minutes", async () => {
			await service.generateParamsToEnable("test@example.com")
			expect(jwtService.signAsync).toBeCalledWith(expect.anything(), { expiresIn: 300 })
		})

		it("should generate needed params for user", async () => {
			await service.generateParamsToEnable("test@example.com")
			expect(service["generateQrCode"]).toBeCalledWith("test@example.com", "Hello")
			expect(jwtService.signAsync).toBeCalledWith(
				{ secret: "Hello", email: "test@example.com", purpose: "enable-mfa" },
				{ expiresIn: 300 },
			)
		})

		it("should return needed data to enable mfa", async () => {
			const res = await service.generateParamsToEnable("test@example.com")
			expect(res).toEqual({
				secret: "Hello",
				image: "base64:test@example.com",
				backupCodes: ["H", "e"],
				jwt: JSON.stringify({ purpose: "enable-mfa", email: "test@example.com", secret: "Hello" }),
			})
		})
	})

	describe("generateSecret", () => {
		it("should encrypt secret", async () => {
			const res = service["generateSecret"]()
			expect(res).toEqual("secret1111")
		})
		//
	})

	describe("generateQrCode", () => {
		it("should generate qr code", async () => {
			const res = await service["generateQrCode"]("hello@world.com", "secret2222")
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
			const valid = await service["checkBackupCode"](secret, "53d8e7f2b7598d")
			expect(valid).toEqual(true)

			const invalid = await service["checkBackupCode"](secret, "53d8e7f2b7598p")
			expect(invalid).toEqual(false)
		})
	})

	describe("decryptSecret", () => {
		it("should return provided value if not encrypted", async () => {
			const res = await service["decryptSecret"]("non_enc")
			expect(res).toEqual("non_enc")
		})
		it("should return provided value if encrypted", async () => {
			const res = await service["decryptSecret"]("$ZM$hello")
			expect(res).toEqual("hello")
			//
		})
	})
})
