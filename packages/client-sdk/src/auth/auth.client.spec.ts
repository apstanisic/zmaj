import { axiosMock } from "@client-sdk/axios.mock"
import { SdkState } from "@client-sdk/sdk-state"
import { SdkStateStub } from "@client-sdk/sdk-state.stub"
import { stubAccessToken, testEnsureCatch } from "@client-sdk/test-utils"
import { AuthUser, SignInDto, SignInResponse, SignUpDto, asMock } from "@zmaj-js/common"
import { AuthUserStub, SignUpDtoStub } from "@zmaj-js/test-utils"
import { AxiosInstance } from "axios"
import { EventEmitter } from "eventemitter3"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthClient } from "./auth.client"

describe("AuthClient", () => {
	let client: AuthClient
	let emitter: EventEmitter<any>
	let http: AxiosInstance
	let state: SdkState
	let user: AuthUser
	let accessToken: string

	beforeEach(() => {
		user = AuthUserStub()
		accessToken = stubAccessToken(user)
		emitter = new EventEmitter()
		http = axiosMock()
		state = SdkStateStub()
		state.setAccessToken(accessToken)
		client = new AuthClient({ emitter, http, state })
	})
	//

	describe("isSignedIn", () => {
		it("should return false if access token does not exist", () => {
			state.setAccessToken(null)
			const res = client.isSignedIn
			expect(res).toBe(false)
		})

		it("should return true if access token exist", () => {
			state.setAccessToken(stubAccessToken())
			const res = client.isSignedIn
			expect(res).toBe(true)
		})
	})

	describe("currentUser", () => {
		it("should get current user from state", () => {
			const user = AuthUserStub()
			state.setAccessToken(stubAccessToken(user))
			const res = client.currentUser
			expect(res).toEqual(user)
		})
	})

	describe("accessToken", () => {
		it("should get access token from state", () => {
			const at = stubAccessToken()
			state.setAccessToken(at)
			const res = client.accessToken
			expect(res).toEqual(at)
		})

		it("should return undefined if there is no access token", () => {
			state.setAccessToken(null)
			const res = client.accessToken
			expect(res).toBeUndefined()
		})
	})

	describe("onAuthChange", () => {
		it("should add listener for auth change", () => {
			emitter.on = vi.fn()
			const fn = vi.fn()
			client.onAuthChange(fn)
			expect(emitter.on).toBeCalledWith("auth", fn)
		})

		it("should return unsubscribe function", () => {
			emitter.on = vi.fn()
			emitter.removeListener = vi.fn()
			const fn = vi.fn()
			const unsubscribe = client.onAuthChange(fn)
			unsubscribe()
			expect(emitter.removeListener).toBeCalledWith("auth", fn)
		})
	})

	describe("oidcSignIn", () => {
		it("should fetch new access token", async () => {
			const fn = vi.fn()
			client["tokensService"].fetchNewAccessToken = fn
			await client.oidcSignIn()
			expect(fn).toBeCalled()
		})

		it("should emit sign in event", async () => {
			client["tokensService"].fetchNewAccessToken = vi.fn()
			emitter.emit = vi.fn()
			await client.oidcSignIn()
			expect(emitter.emit).toBeCalledWith("auth", "sign-in")
		})
	})

	describe("signIn", () => {
		let dto: SignInDto
		let accessToken: string

		beforeEach(() => {
			accessToken = stubAccessToken()
			dto = new SignInDto({ email: "email@example.com", password: "old-password" })
			// client["tokensService"].setAccessToken = vi.fn()
			asMock(http.post).mockResolvedValue({
				data: { accessToken, status: "signed-in", user: AuthUserStub() },
			} satisfies {
				data: SignInResponse
			})
			// state["_currentUser"] = "current_user" as any
		})

		it("should sign user out if it's signed in", async () => {
			client["tokensService"].setAccessToken = vi.fn()
			await client.signIn(dto)

			expect(client["tokensService"].setAccessToken).nthCalledWith(1, null)
			expect(client["tokensService"].setAccessToken).toBeCalledTimes(2)
			//
		})

		it("should make api request to create refresh token and access token", async () => {
			await client.signIn(dto)
			expect(http.post).toBeCalledWith("/auth/sign-in", dto)
		})

		// it("should throw if return access token is not string", async () => {
		// 	asMock(http.post).mockResolvedValue({ data: { accessToken: null } })
		// 	await expect(client.signIn(dto)).rejects.toThrow()
		// })

		it("should store access token", async () => {
			await client.signIn(dto)
			expect(state.getAccessToken()).toEqual(accessToken)
		})

		it("should emit sign in event", async () => {
			emitter.emit = vi.fn()
			await client.signIn(dto)
			expect(emitter.emit).toBeCalledWith("auth", "sign-in")
		})

		it("should return response", async () => {
			const res = await client.signIn(dto)
			expect(res).toEqual({
				status: "signed-in",
				accessToken: expect.any(String),
				user: expect.any(Object),
			})
		})
	})

	describe("signOut", () => {
		beforeEach(() => {
			client["tokensService"].setAccessToken = vi.fn()
			asMock(http.post).mockResolvedValue({ data: { accessToken: "my-at" } })
		})

		it("should remove access token", async () => {
			await client.signOut()
			expect(client["tokensService"].setAccessToken).toBeCalledWith(null)
		})

		it("should call api", async () => {
			await client.signOut()
			expect(http.delete).toBeCalledWith("/auth/sign-out")
		})

		it("should catch api errors", async () => {
			return testEnsureCatch({ client: http, fn: client.signOut })
		})

		it("should emit event", async () => {
			emitter.emit = vi.fn()
			await client.signOut()
			expect(emitter.emit).toBeCalledWith("auth", "sign-out")
		})
	})

	describe("signUp", () => {
		let dto: SignUpDto
		beforeEach(() => {
			dto = new SignUpDto({ email: "test@example.com", password: "my-password" })
			asMock(http.post).mockResolvedValue({ data: { data: "new_user" } })
		})

		it("should call api", async () => {
			await client.signUp(dto)
			expect(http.post).toBeCalledWith("/auth/sign-up", dto)
		})

		it("should catch api errors", async () => {
			return testEnsureCatch({ client: http, fn: async () => client.signUp(dto) })
		})
	})

	describe("sendMagicLink", () => {
		beforeEach(() => {
			asMock(http.post).mockResolvedValue({ data: { success: true } })
		})

		it("should call api", async () => {
			await client.sendMagicLink("email@test")
			expect(http.post).toBeCalledWith("/auth/magic-link", { destination: "email@test" })
		})

		it("should return email", async () => {
			const res = await client.sendMagicLink("email@test")
			expect(res).toEqual("email@test")
		})

		it("should catch api errors", async () => {
			return testEnsureCatch({ client: http, fn: async () => client.sendMagicLink("hello") })
		})
	})

	describe("createFirstAdminAccount", () => {
		let user: AuthUser
		let dto: SignUpDto
		beforeEach(() => {
			dto = SignUpDtoStub()
			user = AuthUserStub()
			asMock(http.post).mockImplementation(async () => ({ data: user }))
		})

		it("should call api", async () => {
			await client.createFirstAdminAccount(dto)
			expect(http.post).toBeCalledWith("/auth/initialize-admin", dto)
		})

		it("should return result", async () => {
			const res = await client.createFirstAdminAccount(dto)
			expect(res).toEqual(user)
		})

		it("should catch api errors", async () => {
			return testEnsureCatch({ client: http, fn: async () => client.createFirstAdminAccount(dto) })
		})
	})
})
