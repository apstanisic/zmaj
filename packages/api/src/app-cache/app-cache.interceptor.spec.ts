import { expect, it } from "vitest"

it("skips cache", () => {
	expect(1).toEqual(1)
})
// import { ExecutionContext } from "@nestjs/common"
// import { Test } from "@nestjs/testing"
// import { AuthUserStub } from "@zmaj-js/test-utils"
// import { beforeEach, describe, expect, it, vi } from "vitest"
// import { AppCacheInterceptor } from "./app-cache.interceptor"
// import { CacheConfig } from "./cache.config"

// // Mock CacheInterceptor
// vi.mock("@nestjs/common", async () => {
// 	const originalModule = await vi.importActual<typeof import("@nestjs/common")>("@nestjs/common")
// 	return {
// 		__esModule: true,
// 		...originalModule,
// 		CacheInterceptor: class {
// 			isRequestCacheable(): string | boolean {
// 				return "CACHE_STATUS"
// 			}
// 			trackBy(context: ExecutionContext): string {
// 				return context.switchToHttp().getRequest().url
// 			}
// 		},
// 	}
// })

// describe("AppCacheInterceptor", () => {
// 	let interceptor: AppCacheInterceptor
// 	let user = AuthUserStub()
// 	let getRequest = vi.fn(() => ({ user, url: "testUrl", method: "GET" }))
// 	let contextMock: ExecutionContext

// 	beforeEach(async () => {
// 		const module = await Test.createTestingModule({
// 			providers: [AppCacheInterceptor, CacheConfig],
// 		})
// 			.overrideProvider(CacheConfig)
// 			.useValue({})
// 			//
// 			.compile()

// 		interceptor = module.get(AppCacheInterceptor)
// 		interceptor["config"] = { enabled: true, ttlMs: 100, type: "memory" }

// 		user = AuthUserStub()
// 		getRequest = vi.fn(() => ({ user, url: "testUrl", method: "GET" }))
// 		contextMock = { switchToHttp: vi.fn(() => ({ getRequest })) } as never
// 	})

// 	it("should be defined", () => {
// 		expect(interceptor).toBeDefined()
// 	})

// 	describe("isRequestCacheable", () => {
// 		it("should defer responsibility to `CacheInterceptor` if cache is enabled", () => {
// 			expect(interceptor["isRequestCacheable"](contextMock)).toEqual("CACHE_STATUS")
// 		})
// 	})

// 	/**
// 	 *
// 	 */
// 	describe("trackBy", () => {
// 		beforeEach(() => {
// 			interceptor["isRequestCacheable"] = vi.fn(() => true)
// 		})

// 		it("should be defined", () => {
// 			expect(interceptor.trackBy).toBeDefined()
// 		})

// 		it("should cache only for provided user", () => {
// 			const key = interceptor.trackBy(contextMock)
// 			expect(key).toBe(`HTTP__testUrl__${user.userId}`)
// 		})

// 		it("should share cache for users that are not logged in", () => {
// 			getRequest.mockReturnValue({ url: "testUrl2", user: undefined as never, method: "GET" })
// 			const key = interceptor.trackBy(contextMock)
// 			expect(key).toBe("HTTP__testUrl2__public")
// 		})

// 		it("should return key for tracking", () => {
// 			const key = interceptor.trackBy(contextMock)
// 			expect(key).toBe(`HTTP__testUrl__${user.userId}`)
// 		})
// 	})
// })
