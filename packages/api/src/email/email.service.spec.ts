import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { asMock } from "@zmaj-js/common"
import { createTransport } from "nodemailer"
import Mail from "nodemailer/lib/mailer"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EmailConfig } from "./email.config"
import { EmailService } from "./email.service"

vi.mock("nodemailer", () => ({
	default: {},
	createTransport: vi.fn(() => ({ verify: vi.fn() })),
}))

const configParams: EmailConfig = {
	host: "localhost",
	password: "password",
	port: 2,
	secure: true,
	user: "test@example.com",
	enabled: true,
}

describe("EmailService", () => {
	let service: EmailService
	let emailConfig: EmailConfig

	beforeEach(async () => {
		const module = await buildTestModule(EmailService, [
			{
				provide: EmailConfig,
				useValue: new EmailConfig(configParams, { get: vi.fn() } as any),
			},
		]).compile()
		service = module.get(EmailService)
		emailConfig = module.get(EmailConfig)

		service["transporter"] = {} as any
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(EmailService)
	})

	/**
	 *
	 */
	describe("onModuleInit", () => {
		it("should be initialized with data from config", async () => {
			await service.onModuleInit()
			expect(createTransport).toBeCalledWith(
				{
					host: "localhost",
					port: 2,
					secure: true,
					auth: {
						user: "test@example.com",
						pass: "password",
					},
				},
				{ from: "test@example.com", subject: "Zmaj App" },
			)
		})

		it("should not be created if config is not provided", async () => {
			emailConfig.enabled = false
			await service.onModuleInit()
			expect(createTransport).not.toBeCalled()
		})

		it("should initialize mailer on module init", async () => {
			const verify = vi.fn()
			asMock(createTransport).mockReturnValue({ verify })
			await service.onModuleInit()
			expect(verify).toBeCalledTimes(1)
		})
	})

	/**
	 *
	 */
	describe("sendMail", () => {
		it("should throw an error if user tries to send email and mail is not configured", async () => {
			service["transporter"] = undefined
			await expect(service.sendEmail({})).rejects.toThrow(InternalServerErrorException)
		})

		it("should call `nodemailer.sendMail` if transporter is defined", async () => {
			const sendMail = vi.fn()
			service["transporter"]!.sendMail = sendMail
			const sendData: Mail.Options = { text: "hello", html: "world", subject: "Hello" }
			await service.sendEmail(sendData)
			expect(sendMail).toBeCalledWith({ ...sendData, subject: "Hello - Zmaj App" })
		})

		it("should throw if sending email fails", async () => {
			const sendMail = vi.fn().mockRejectedValue(new Error())
			service["transporter"]!.sendMail = sendMail
			await expect(service.sendEmail({})).rejects.toThrow(InternalServerErrorException)
		})
	})
})
