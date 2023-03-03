import { BadRequestException, ExecutionContext } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { createBasicToken } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BasicAuthGuard } from "./basic-auth.guard"

const superCanActivate = vi.fn()

vi.mock("@nestjs/passport", () => ({
	AuthGuard: () => {
		return class {
			canActivate(c: any): any {
				return superCanActivate(c)
			}
		}
	},
}))

describe("BasicAuthGuard", () => {
	let guard: BasicAuthGuard
	let mockContext: ExecutionContext

	const getRequest = vi.fn().mockImplementation(() => ({ headers: {} }))

	beforeEach(() => {
		guard = new BasicAuthGuard()
		mockContext = {
			switchToHttp: () => ({ getRequest }),
		} as any

		getRequest.mockClear()
		superCanActivate.mockClear()
	})
	it("should be defined", () => {
		expect(guard).toBeInstanceOf(BasicAuthGuard)
	})

	/**
	 *
	 */
	describe("canActivate", () => {
		it("should not be activated if Basic header is not provided", async () => {
			getRequest.mockReturnValue({ headers: {} })
			const res1 = await guard.canActivate(mockContext)
			expect(res1).toEqual(true)

			const jwtService = new JwtService({ secret: "qwerty" })
			const bearer = "Bearer " + jwtService.sign({ hello: "world" })

			getRequest.mockReturnValue({ headers: { authorization: bearer } })
			const res2 = await guard.canActivate(mockContext)
			expect(res2).toEqual(true)

			expect(superCanActivate).not.toBeCalled()
		})

		it("should check if Basic header is provided", async () => {
			const basicToken = createBasicToken("test@example.com", "password")
			getRequest.mockReturnValue({ headers: { authorization: basicToken } })
			superCanActivate.mockResolvedValue(true)
			await guard.canActivate(mockContext)
			expect(superCanActivate).toBeCalledWith(mockContext)
		})

		it("should pass error to NestJS if auth fails", async () => {
			const basicToken = createBasicToken("test@example.com", "password")
			getRequest.mockReturnValue({ headers: { authorization: basicToken } })
			superCanActivate.mockRejectedValue(new BadRequestException())
			await expect(guard.canActivate(mockContext)).rejects.toThrow(BadRequestException)
		})
	})
})
