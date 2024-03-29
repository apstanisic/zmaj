import { buildTestModule } from "@api/testing/build-test-module"
import { ADMIN_ROLE_ID, PUBLIC_ROLE_ID } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationState, DbAuthorizationRole } from "./authorization.state"
import { RoleStub } from "./roles/role.stub"

describe("AuthorizationState", () => {
	let service: AuthorizationState

	beforeEach(async () => {
		const module = await buildTestModule(AuthorizationState).compile()
		service = module.get(AuthorizationState)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(AuthorizationState)
	})

	describe("ensureRequiredRolesExist", () => {
		const roles: Record<string, DbAuthorizationRole> = {
			[ADMIN_ROLE_ID]: {
				...RoleStub({ id: ADMIN_ROLE_ID }),
				permissions: [] as never,
				rules: {},
			},
			[PUBLIC_ROLE_ID]: {
				...RoleStub({ id: PUBLIC_ROLE_ID }),
				permissions: [] as never,
				rules: {},
			},
		}
		beforeEach(() => {
			service["rolesRepo"].createOne = vi.fn()
			service["rolesRepo"].findWhere = vi.fn(async () => Object.values(roles) as any)
		})

		//
		it("should do nothing if roles exist", async () => {
			service.roles = roles
			await service["ensureRequiredRolesExist"]()
			expect(service["rolesRepo"].createOne).not.toBeCalled()
		})

		it("should create admin role if missing", async () => {
			service.roles = {
				[PUBLIC_ROLE_ID]: roles[PUBLIC_ROLE_ID]!,
			}
			await service["ensureRequiredRolesExist"]()
			expect(service["rolesRepo"].createOne).toBeCalledWith({
				data: expect.objectContaining({ id: ADMIN_ROLE_ID, name: "Admin" }),
			})
		})

		it("should create public role if missing", async () => {
			service.roles = {
				[ADMIN_ROLE_ID]: roles[ADMIN_ROLE_ID]!,
			}
			await service["ensureRequiredRolesExist"]()
			expect(service["rolesRepo"].createOne).toBeCalledWith({
				data: expect.objectContaining({ id: PUBLIC_ROLE_ID, name: "Public" }),
			})
		})

		it("should refresh roles state if role created", async () => {
			vi.mocked(service["rolesRepo"].findWhere).mockResolvedValue([])
			service.roles = { [ADMIN_ROLE_ID]: roles[ADMIN_ROLE_ID]! }
			await service["ensureRequiredRolesExist"]()
			expect(service["rolesRepo"].findWhere).toBeCalled()
		})
	})

	describe("onRoleChange", () => {
		beforeEach(() => {
			service.onModuleInit = vi.fn()
		})

		it("should not do anything if it's only reading", async () => {
			await service.__onRoleChange({ action: "read" } as any)
			expect(service.onModuleInit).not.toBeCalled()
		})

		it("should refresh roles when changed", async () => {
			await service.__onRoleChange({ action: "update" } as any)
			expect(service.onModuleInit).toBeCalled()
		})
	})

	describe("onPermissionChange", () => {
		beforeEach(() => {
			service.onModuleInit = vi.fn()
		})

		it("should not do anything if it's only reading", async () => {
			await service.__onPermissionChange({ action: "read" } as any)
			expect(service.onModuleInit).not.toBeCalled()
			//
		})

		it("should refresh permissions when changed", async () => {
			await service.__onPermissionChange({ action: "update" } as any)
			expect(service.onModuleInit).toBeCalled()
		})
	})
})
