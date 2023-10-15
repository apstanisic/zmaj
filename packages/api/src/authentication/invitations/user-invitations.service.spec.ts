import { CreateFinishEventStub } from "@api/crud/__mocks__/create-event.stubs"
import { type CreateFinishEvent } from "@api/crud/crud-event.types"
import { EmailCallbackService } from "@api/email/email-callback.service"
import { EmailService } from "@api/email/email.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestingModule } from "@nestjs/testing"
import { times, User, UserCollection } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UserInvitationsService } from "./user-invitations.service"

describe("UsersService", () => {
	let module: TestingModule
	let service: UserInvitationsService
	let emailCallbackService: EmailCallbackService
	let emailService: EmailService

	let user: User

	beforeEach(async () => {
		module = await buildTestModule(UserInvitationsService).compile()

		user = UserStub({ confirmedEmail: true, status: "active" })
		//
		service = module.get(UserInvitationsService)
		emailService = module.get(EmailService)
		emailService.sendEmail = vi.fn(async () => {})
		emailCallbackService = module.get(EmailCallbackService)
		emailCallbackService.createJwtCallbackUrl = vi.fn(
			async () => new URL("http://example.com?token=test"),
		)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(UserInvitationsService)
	})

	describe("__sendInvitationEmail", () => {
		let users: User[]
		let event: CreateFinishEvent<User>

		beforeEach(() => {
			users = times(10, (i) => UserStub({ status: i % 2 === 0 ? "invited" : "active" }))
			event = CreateFinishEventStub({
				collection: UserCollection,
				result: users,
			})
		})

		it("should send invitation email for every created user with status invited", async () => {
			await service.__sendInvitationEmail(event)
			expect(emailCallbackService.createJwtCallbackUrl).toBeCalledTimes(5)
			expect(emailService.sendEmail).toBeCalledTimes(5)
		})

		it("should set token and email properly", async () => {
			await service.__sendInvitationEmail(event)
			expect(emailService.sendEmail).nthCalledWith(1, {
				subject: "Invitation",
				to: users[0]!.email,
				text: "Go to http://example.com/?token=test to confirm invitation",
				html: expect.stringContaining("http://example.com/?token=test"),
			})
		})
	})
})
