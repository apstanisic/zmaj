import { ExecutionContext } from "@nestjs/common"
import { Struct } from "@zmaj-js/common"
import { Request } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ValidBodySchema, ValidParamsSchema, ValidQuerySchema } from "./parsed-request.schemas"
import { RequestParserInterceptor } from "./request-parser.interceptor"

describe("RequestParserInterceptor", () => {
	let interceptor: RequestParserInterceptor

	beforeEach(() => {
		interceptor = new RequestParserInterceptor()
	})

	/**
	 *
	 */
	it("should be defined", () => {
		expect(interceptor).toBeDefined()
	})

	/**
	 *
	 */
	describe("intercept", () => {
		let context: ExecutionContext
		const next = { handle: vi.fn(() => 123) as any }
		let req: Partial<Request> & Struct

		beforeEach(() => {
			req = { body: { b: 1 }, query: { q: "1" }, params: { p: "1" } }
			context = { switchToHttp: () => ({ getRequest: vi.fn(() => req) }) } as any
		})

		it("should parse request body", () => {
			ValidBodySchema.parse = vi.fn().mockImplementation((v) => v)
			interceptor.intercept(context, next)
			expect(req.parsedBody).toEqual({ b: 1 })
		})

		it("should parse request params", () => {
			ValidParamsSchema.parse = vi.fn().mockImplementation((v) => v)
			interceptor.intercept(context, next)
			expect(req.parsedParams).toEqual({ p: "1" })
		})

		it("should parse request query", () => {
			ValidQuerySchema.parse = vi.fn().mockImplementation((v) => v)
			interceptor.intercept(context, next)
			expect(req.parsedQuery).toEqual({ q: "1" })
		})

		it("should return executed next handler", async () => {
			const value = interceptor.intercept(context, next)
			expect(value).toBe(123)
		})
	})
})
