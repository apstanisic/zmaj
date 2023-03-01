import { AuthSession } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthSessionStub } from "./auth-session.stub"
import { UserAgentService } from "./user-agent.service"

describe("UserAgentService", () => {
	const userAgentStub =
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Safari/537.36"
	//
	let service: UserAgentService
	beforeEach(() => {
		service = new UserAgentService()
	})

	describe("expandUserAgent", () => {
		it("should expand user agent", () => {
			const res = service.expandUserAgent(userAgentStub)
			expect(res).toEqual({
				browser: {
					name: "Chrome",
					version: "99.0.4844.88",
				},
				device: {
					type: undefined,
					vendor: undefined,
				},
				os: {
					name: "Linux",
					version: "x86_64",
				},
			})
		})
	})

	describe("expandPublicSession", () => {
		let sessionStub: AuthSession
		beforeEach(() => {
			sessionStub = AuthSessionStub()
			service.expandUserAgent = vi.fn().mockReturnValue({ expanded: true })
		})
		it("should expand public auth session", () => {
			const res = service.expandPublicSession(sessionStub)
			expect(res).toEqual({ ...sessionStub, expanded: true })
		})
	})
})
