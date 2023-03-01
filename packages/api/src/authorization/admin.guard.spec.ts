import { ExecutionContext, ForbiddenException } from "@nestjs/common"
import { ADMIN_ROLE_ID } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { Request } from "express"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminGuard } from "./admin.guard"

describe("AdminGuard", () => {
	let guard: AdminGuard
	let ctx: ExecutionContext
	let req: Request

	beforeEach(() => {
		guard = new AdminGuard()
		req = {} as any
		ctx = { switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn(() => req) }) } as any
	})

	it("should throw if user is not admin", async () => {
		req.user = AuthUserStub({ roleId: v4() })
		expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
	})

	it("should return true if user's role is admin", async () => {
		req.user = AuthUserStub({ roleId: ADMIN_ROLE_ID })
		const res = await guard.canActivate(ctx)
		expect(res).toEqual(true)

		//
	})
})
