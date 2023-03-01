import { type CreateFinishEvent } from "@api/crud/crud-event.types"
import { CreateFinishEventStub } from "@api/crud/__mocks__/create-event.stubs"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { TestingModule } from "@nestjs/testing"
import { asMock, times, User, UserCollection } from "@zmaj-js/common"
import { UserStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UserInvitationsService } from "./user-invitations.service"

describe("UsersService", () => {
	let module: TestingModule
	let service: UserInvitationsService
	let tokenService: SecurityTokensService

	let user: User

	beforeEach(async () => {
		module = await buildTestModule(UserInvitationsService).compile()

		user = UserStub({ confirmedEmail: true, status: "active" })
		//
		service = module.get(UserInvitationsService)
		tokenService = module.get(SecurityTokensService)
		tokenService.createTokenWithEmailConfirmation = vi.fn(async () => {})
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
			expect(tokenService.createTokenWithEmailConfirmation).toBeCalledTimes(5)
		})
		it("should set token and email properly", async () => {
			event.result = [users[0]!]
			let emailFnResult: any
			asMock(tokenService.createTokenWithEmailConfirmation).mockImplementation(async (params) => {
				emailFnResult = params.emailParams("my-url", "world")
			})
			await service.__sendInvitationEmail(event)
			expect(emailFnResult).toEqual({
				subject: "Invitation",
				to: users[0]!.email,
				text: "Go to my-url to confirm invitation",
				html: expect.stringContaining("my-url"),
				//
			})
		})
	})
})
