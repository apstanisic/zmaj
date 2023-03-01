import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock, ChangeEmailDto } from "@zmaj-js/common"
import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ProfileClient } from "./profile.client"

vi.mock("axios")

describe("ProfileClient", () => {
	let profile: ProfileClient
	beforeEach(() => {
		profile = new ProfileClient(axios)
	})

	describe("getUserInfo", () => {
		beforeEach(() => {
			asMock(axios.get).mockResolvedValue({ data: { data: "response" } })
		})

		it("should call api", async () => {
			const res = await profile.getUserInfo()
			expect(axios.get).toBeCalledWith("/auth/account/profile")
			expect(res).toEqual("response")
		})
		it("should handle api error", () => testEnsureCatch({ client: axios, fn: profile.getUserInfo }))
	})

	describe("changeUserInfo", () => {
		beforeEach(() => {
			asMock(axios.put).mockResolvedValue({ data: { data: "response" } })
		})

		it("should call api", async () => {
			const res = await profile.changeUserInfo({ firstName: "hello" })
			expect(axios.put).toBeCalledWith("/auth/account/profile", { firstName: "hello" })
			expect(res).toEqual("response")
		})
		it("should handle api error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => profile.changeUserInfo({ firstName: "test" }),
			}))
	})

	describe("changePassword", () => {
		beforeEach(() => {
			asMock(axios.put).mockResolvedValue({ data: { email: "email-1" } })
		})

		it("should call api", async () => {
			const dto = { newPassword: "hello", oldPassword: "world" }
			const res = await profile.changePassword(dto)
			expect(axios.put).toBeCalledWith("/auth/account/password", dto)
			expect(res).toEqual("email-1")
		})

		it("should handle api error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => profile.changePassword({ newPassword: "", oldPassword: "" }),
			}))
	})

	describe("requestEmailChange", () => {
		let params: ChangeEmailDto
		beforeEach(() => {
			asMock(axios.put).mockResolvedValue({ data: { newEmail: "email-1", currentEmail: "old-1" } })
			params = {
				newEmail: "test@example.com",
				password: "test-pass",
			}
		})

		it("should call api", async () => {
			const res = await profile.requestEmailChange(params)
			expect(axios.put).toBeCalledWith("/auth/account/email-change", params)
			expect(res).toEqual("email-1")
		})

		it("should handle api error", () =>
			testEnsureCatch({
				client: axios,
				fn: async () => profile.requestEmailChange(params),
			}))
	})
})
