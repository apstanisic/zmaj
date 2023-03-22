import { AuthUser } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import EventEmitter from "eventemitter3"
import type { Writable } from "type-fest"
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { SdkState } from "./sdk-state"
import { stubAccessToken } from "./test-utils"

describe("SdkState", () => {
	let emitter: EventEmitter<any>
	let state: SdkState
	let user: AuthUser
	let accessToken: string

	beforeEach(() => {
		emitter = new EventEmitter()
		state = new SdkState({ emitter })
		user = AuthUserStub({ email: "test@example.com" })
		accessToken = stubAccessToken(user)
	})

	describe("storageKey", () => {
		it("should generate storage key", () => {
			const state = new SdkState({ emitter, sdkName: "hello" })
			expect(state["storageKey"]).toEqual("ZMAJ_STORAGE_hello")
		})

		it("should have default storage key", () => {
			expect(state["storageKey"]).toEqual("ZMAJ_STORAGE_DEFAULT")
		})
	})

	describe("onStorageEvent", () => {
		let event: Partial<Writable<StorageEvent>>

		beforeEach(() => {
			event = {
				newValue: "newVal",
				oldValue: "oldVal",
				storageArea: "storage1" as never,
				key: "someKey",
			}
			globalThis.window = { addEventListener: vi.fn(), localStorage: {} } as any
			emitter.emit = vi.fn()
		})
		afterEach(() => {
			globalThis.window = undefined as any
		})

		it("should attach listener if only in there is local storage", () => {
			globalThis.window = undefined as any
			expect(() => new SdkState({ emitter })).not.toThrow()
		})

		it("should attach event listener in browser", () => {
			;(globalThis.window.addEventListener as Mock).mockReset()
			const state = new SdkState({ emitter })
			expect(globalThis.window.addEventListener).toBeCalledWith("storage", expect.any(Function))
		})

		it("should react only if auth key is changed", () => {
			event.key = state["storageKey"] + "diff"
			state["onStorageEvent"](event as any)
			expect(emitter.emit).not.toBeCalled()
		})

		it("should react only if auth key it's in localStorage", () => {
			event.key = state["storageKey"]
			event.storageArea = "notLc" as any
			state["onStorageEvent"](event as any)
			expect(emitter.emit).not.toBeCalled()
		})

		it("should should set access key", () => {
			event.key = state["storageKey"]
			event.storageArea = globalThis.window.localStorage
			state.setAccessToken = vi.fn()

			state["onStorageEvent"](event as any)
			expect(state.setAccessToken).toBeCalled()
		})

		describe("emit", () => {
			beforeEach(() => {
				event.key = state["storageKey"]
				event.storageArea = globalThis.window.localStorage
				emitter.emit = vi.fn()
			})
			it("should emit changes as logout", () => {
				event.newValue = null
				state["onStorageEvent"](event as any)
				expect(emitter.emit).toBeCalledWith("auth", "sign-out")
			})
			it("should emit changes as refresh", () => {
				event.oldValue = stubAccessToken()
				event.newValue = stubAccessToken()
				state["onStorageEvent"](event as any)
				expect(emitter.emit).toBeCalledWith("auth", "refresh")
			})
			it("should emit changes as sign-in", () => {
				event.newValue = stubAccessToken()
				event.oldValue = null
				state["onStorageEvent"](event as any)
				expect(emitter.emit).toBeCalledWith("auth", "sign-in")
			})
		})
	})

	describe("set accessToken", () => {
		it("should set access token and current user to null", () => {
			state["_accessToken"] = "hello"
			state["_currentUser"] = "current user" as never
			state.setAccessToken(null)
			expect(state["_accessToken"]).toBeNull()
			expect(state["_currentUser"]).toBeUndefined()
		})

		it("should set access token and create current user info", () => {
			state.setAccessToken(null) // "hello world"
			state.setAccessToken(accessToken) // "hello world"
			expect(state.getAccessToken()).toEqual(accessToken)
			expect(state.currentUser?.email).toEqual("test@example.com")
		})
	})

	//
	describe("get accessToken", () => {
		it("should return access token", () => {
			state["_accessToken"] = "test me"
			expect(state.getAccessToken()).toBe("test me")
		})
	})

	describe("get currentUser", () => {
		it("should return current user", () => {
			const user = AuthUserStub()
			state["_currentUser"] = user
			expect(state.currentUser).toEqual(user)
		})
	})
})
