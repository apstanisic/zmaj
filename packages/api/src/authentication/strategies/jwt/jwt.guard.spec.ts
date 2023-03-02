import { BadRequestException, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { createBasicToken } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { JwtGuard } from "./jwt.guard"

const superCanActivate = vi.fn().mockResolvedValue(true)

vi.mock("@nestjs/passport", () => ({
	AuthGuard: () => {
		return class {
			canActivate(c: any): any {
				return superCanActivate(c)
			}
		}
	},
}))

describe("JwtGuard", () => {
	let guard: JwtGuard
	let mockContext: ExecutionContext

	const getRequest = vi.fn().mockImplementation(() => ({ headers: {}, query: {} }))

	beforeEach(() => {
		guard = new JwtGuard()
		mockContext = {
			switchToHttp: () => ({ getRequest }),
		} as any

		getRequest.mockClear()
		superCanActivate.mockClear()
	})
	it("should be defined", () => {
		expect(guard).toBeInstanceOf(JwtGuard)
	})

	/**
	 *
	 */
	describe("canActivate", () => {
		it("should not be activated if Bearer header or accessToken in query is not provided", async () => {
			getRequest.mockReturnValue({ headers: {}, query: {} })
			const res1 = await guard.canActivate(mockContext)
			expect(res1).toEqual(true)

			const basicToken = createBasicToken("test@example.com", "password")
			getRequest.mockReturnValue({ query: {}, headers: { authorization: basicToken } })
			const res2 = await guard.canActivate(mockContext)
			expect(res2).toEqual(true)

			expect(superCanActivate).not.toBeCalled()
		})

		it("should check if Bearer header is provided", async () => {
			getRequest.mockReturnValue({ query: {}, headers: { authorization: "Bearer HELLO_WORLD" } })
			await guard.canActivate(mockContext)
			expect(superCanActivate).toBeCalledWith(mockContext)
		})

		it("should check if access token in query is provided", async () => {
			getRequest.mockReturnValue({ query: { accessToken: "HELLO_WORLD" }, headers: {} })
			await guard.canActivate(mockContext)
			expect(superCanActivate).toBeCalledWith(mockContext)
		})

		it("should throw our error if can activate throws", async () => {
			getRequest.mockReturnValue({ headers: { authorization: "Bearer HELLO_WORLD" }, query: {} })
			superCanActivate.mockRejectedValue(new BadRequestException())
			await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException)
		})
	})
})
