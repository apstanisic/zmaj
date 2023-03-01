import { GlobalConfig } from "@api/app/global-app.config"
import MagicLoginStrategy from "passport-magic-login"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MagicLinkService } from "./magic-link.service"
import { MagicLinkStrategy } from "./magic-link.strategy"

const testSuper = vi.fn()

vi.mock("@nestjs/passport", async () => ({
	...(await vi.importActual<typeof import("@nestjs/passport")>("@nestjs/passport")),
	PassportStrategy: () =>
		class ParentStrategy {
			constructor(params: any) {
				testSuper(params)
			}
		},
}))

describe("MagicLinkStrategy", () => {
	let service: MagicLinkService
	let config: GlobalConfig
	beforeEach(() => {
		service = { sendMagicLink: vi.fn(), verify: vi.fn() } as Partial<MagicLinkService> as any
		config = { secretKey: "hello-world" } as any
	})
	afterEach(() => {
		testSuper.mockClear()
	})

	it("should pass correct info to supper", () => {
		new MagicLinkStrategy(config, service)
		expect(testSuper).toBeCalledWith(
			expect.objectContaining({
				secret: "hello-world", //
				callbackUrl: "/auth/magic-link/callback",
			}),
		)
	})

	it("should not pass /api at beginning of callback url", () => {
		// this value is added in service
		new MagicLinkStrategy(config, service)

		expect(testSuper).not.toBeCalledWith(
			expect.objectContaining({
				callbackUrl: "/api/auth/magic-link/callback",
			}),
		)
		expect(testSuper).toBeCalledWith(
			expect.objectContaining({
				callbackUrl: expect.not.stringContaining("api/"),
			}),
		)
	})
	it("should not be called with absolute url", () => {
		new MagicLinkStrategy(config, service)
		expect(testSuper).toBeCalledWith(
			expect.objectContaining({
				callbackUrl: expect.not.stringContaining("http"),
			}),
		)
	})

	it("should use service for sending link and verifying", async () => {
		let params: ConstructorParameters<typeof MagicLoginStrategy>[0] = {} as any
		testSuper.mockImplementationOnce((pr) => (params = pr))

		new MagicLinkStrategy(config, service)

		params.verify("py", "done" as any, "res" as any)
		expect(service.verify).toBeCalledWith("py", "done")

		await params.sendMagicLink("dest", "href", "" as any, "" as any)
		expect(service.sendMagicLink).toBeCalledWith("dest", "href")
	})
})
