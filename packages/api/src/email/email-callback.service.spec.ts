import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { TestingModule } from "@nestjs/testing"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { EmailCallbackService } from "./email-callback.service"

describe("EmailCallbackService", () => {
	let module: TestingModule
	let service: EmailCallbackService
	let jwtService: JwtService

	beforeEach(async () => {
		module = await buildTestModule(EmailCallbackService).compile()
		service = module.get(EmailCallbackService)
		jwtService = module.get(JwtService)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(EmailCallbackService)
	})

	describe("createJwtCallbackUrl", () => {
		beforeEach(() => {
			jwtService.signAsync = vi.fn(async () => "signed.token.value")
		})

		it("should pass data to JWT token", async () => {
			const userId = v4()
			await service.createJwtCallbackUrl({
				expiresIn: "5d",
				path: "/hello/world",
				usedFor: "TESTING",
				userId,
				data: { additional: "data" },
			})
			expect(jwtService.signAsync).toBeCalledWith(
				{
					sub: userId,
					type: "TESTING",
					additional: "data",
				},
				{
					expiresIn: "5d",
				},
			)
		})

		it("should set returned JWT as token param in URL", async () => {
			const url = await service.createJwtCallbackUrl({
				expiresIn: "5d",
				path: "/hello/world",
				usedFor: "TESTING",
				userId: v4(),
				data: { additional: "data" },
			})

			expect(url.toString()).toEqual(
				"http://localhost:5000/api/hello/world?token=signed.token.value",
			)
		})
	})

	describe("verifyJwtCallback", () => {
		const jwtTokenSchema = z.object({
			sub: z.string(),
			type: z.literal("test"),
		})

		beforeEach(() => {
			jwtService.verifyAsync = vi.fn(async () => ({ test: "value" }) as never)
		})

		it("should throw if JWT verification throws", async () => {
			vi.mocked(jwtService.verifyAsync).mockRejectedValue(new Error())
			await expect(
				service.verifyJwtCallback({
					schema: jwtTokenSchema,
					token: "hello.world.test",
				}),
			).rejects.toThrow()
		})

		it("should force to validate against schema to ensure only allowed value are passed", async () => {
			vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: "hello", type: "not_test" })
			await expect(
				service.verifyJwtCallback({
					schema: jwtTokenSchema,
					token: "hello.world.test",
				}),
			).rejects.toThrow(BadRequestException)
		})

		it("should return JWT content", async () => {
			vi.mocked(jwtService.verifyAsync).mockResolvedValue({
				sub: "hello",
				type: "test",
			})
			const result = await service.verifyJwtCallback({
				schema: jwtTokenSchema,
				token: "hello.world.test",
			})
			expect(result).toEqual({ sub: "hello", type: "test" })
		})

		it("should return only specified values in JWT", async () => {
			vi.mocked(jwtService.verifyAsync).mockResolvedValue({
				sub: "hello",
				type: "test",
				hello: "world",
				hello2: "world",
			})
			const result = await service.verifyJwtCallback({
				schema: jwtTokenSchema.merge(z.object({ hello: z.string() })),
				token: "hello.world.test",
			})
			expect(result).toEqual({ sub: "hello", type: "test", hello: "world" })
		})
	})
})
