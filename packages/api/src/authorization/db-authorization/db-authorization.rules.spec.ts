import { PermissionStub } from "@api/authorization/db-authorization/permissions/permissions.stub"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { InternalServerErrorException } from "@nestjs/common"
import { rand } from "@ngneat/falso"
import { ADMIN_ROLE_ID, AuthUser, PUBLIC_ROLE_ID, Permission, times } from "@zmaj-js/common"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { addDays, differenceInHours } from "date-fns"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorizationConfig } from "../authorization.config"
import { AuthorizationState } from "../db-authorization/authorization.state"
import { RoleStub } from "../db-authorization/roles/role.stub"
import { DbAuthorizationRules } from "./db-authorization.rules"

describe("AuthorizationService", () => {
	let service: DbAuthorizationRules
	let authzState: AuthorizationState
	let authzConfig: AuthorizationConfig
	let infraState: InfraStateService
	let user: AuthUser

	beforeEach(async () => {
		const module = await buildTestModule(DbAuthorizationRules, [
			{
				provide: AuthorizationConfig,
				useValue: new AuthorizationConfig({ exposeAllowedPermissions: true }),
			},
		]).compile()

		user = AuthUserStub()
		service = module.get(DbAuthorizationRules)
		//
		infraState = module.get(InfraStateService)
		//
		authzConfig = module.get(AuthorizationConfig)
		//
		authzState = module.get(AuthorizationState)

		const roles = times(5, (i) => RoleStub({ name: `role_${i}` }))
		for (const role of roles) {
			role.rules
		}
		authzState.roles = Object.fromEntries
		authzState.permissions = times(30, () =>
			PermissionStub({
				roleId: rand(authzState.roles.map((r) => r.id)),
			}),
		)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(DbAuthorizationRules)
	})

	/**
	 *
	 */
	describe("injectDynamicValues", () => {
		let permission: Permission

		beforeEach(() => {
			user = AuthUserStub()
			permission = PermissionStub({
				conditions: {
					name: "_$CURRENT_USER",
					numb: { $gte: 10 },
					withHook: "$CURRENT_USER",
					user: { $ne: "$CURRENT_USER" },
					noHook: "CURRENT_USER",
					$and: [{ id: 5 }, { name: "$CURRENT_USER" }],
				},
			})
		})

		it("should only inject relevant value", () => {
			const res = service["injectDynamicValues"]({ permission, user })
			expect(res).toEqual({
				name: "$CURRENT_USER",
				numb: { $gte: 10 }, //
				withHook: user.userId,
				user: { $ne: user.userId },
				noHook: "CURRENT_USER",
				$and: [{ id: 5 }, { name: user.userId }],
			})
		})

		it("should throw if transformer does not exist", () => {
			// better to throw that to user accidentally reveals inner workings
			permission.conditions = { id: "$NON_EXISTING" }
			expect(() => service["injectDynamicValues"]({ permission, user })).toThrow(
				InternalServerErrorException,
			)
		})

		it("should call transformer with modifier", () => {
			vi.useFakeTimers()

			permission.conditions = { createdAt: "$CURRENT_DATE:17d" }

			const res = service["injectDynamicValues"]({ user, permission })
			// we have to check like this, since daylight saving time can cause problem,
			// since ms does not know about it
			const diff = differenceInHours(res["createdAt"] as Date, addDays(new Date(), 17))
			expect(diff).toBeLessThanOrEqual(1)
			expect(res).toEqual({ createdAt: expect.any(Date) })
			// expect(res).toEqual({ createdAt: addDays(new Date(), 17) })

			vi.useRealTimers()
		})
	})

	/**
	 *
	 */
	describe("getRules", () => {
		//
		it("should allow all actions for admin", () => {
			user.roleId = ADMIN_ROLE_ID
			const rules = service.getRules(user)
			expect(rules.rules).toEqual([{ action: "manage", subject: "all" }])
		})

		it("should get relevant dynamic values ", () => {
			const permission = PermissionStub({ roleId: user.roleId })
			authzState.roles[ADMIN_ROLE_ID]!.permissions = [permission as any]
			service["injectDynamicValues"] = vi.fn().mockImplementation(() => ({ id: "mock-id" }))

			service.getRules(user)

			expect(service["injectDynamicValues"]).toBeCalledWith({
				permission: permission,
				user: user,
			})
		})

		it("should inject dynamic values", () => {
			authzState.permissions = [PermissionStub({ roleId: PUBLIC_ROLE_ID })]
			service["injectDynamicValues"] = vi.fn().mockImplementation(() => ({ id: "mock-id" }))

			const rules = service.getRules()

			expect(rules.rules[0]?.conditions).toEqual({ id: "mock-id" })
		})

		describe("get relevant permissions", () => {
			let user: AuthUser

			beforeEach(() => {
				user = AuthUserStub()

				authzState.permissions = times(10, (i) =>
					PermissionStub({
						roleId: i < 5 ? user.roleId : v4(),
						fields: [`f${i}`],
						conditions: { toInject: "$CURRENT_USER" },
						resource: `collections.testTable${i}`,
					}),
				)

				service["injectDynamicValues"] = vi.fn().mockReturnValue({ injected: "values" })
			})

			it("should get rules for current user", () => {
				const res = service.getRules(user)
				expect(res.rules.length).toEqual(5)

				for (let i = 0; i < 5; i++) {
					const rule = res.rules[i]!
					expect(rule).toEqual({
						action: rule.action,
						conditions: { injected: "values" }, //
						fields: ["f" + i],
						subject: "collections.testTable" + i,
					})
				}

				expect.assertions(6)
			})

			it("should get public rules if user is not signed in", () => {
				authzState.permissions = [
					PermissionStub({ roleId: PUBLIC_ROLE_ID }),
					PermissionStub({ roleId: v4() }),
				]
				const res = service.getRules()
				expect(res.rules.length).toEqual(1)
			})

			it("should not add permission if no field is allowed", () => {
				authzState.permissions = [PermissionStub({ roleId: PUBLIC_ROLE_ID, fields: [] })]
				const res = service.getRules()
				expect(res.rules.length).toEqual(0)
			})

			it("should forbid having resource with name 'all' since it's reserved word", async () => {
				authzState.permissions = [
					PermissionStub({
						resource: "all",
						roleId: PUBLIC_ROLE_ID,
						fields: null,
						action: "create",
					}),
				]
				const res = service.getRules()
				expect(res.rules).toEqual([
					{
						action: "create",
						conditions: { injected: "values" },
						subject: "collections.all",
					},
				])
			})
		})
	})
})
