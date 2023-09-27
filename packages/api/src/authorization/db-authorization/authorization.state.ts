import type { CrudAfterEvent } from "@api/crud/crud-event.types"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
	ADMIN_ROLE_ID,
	PUBLIC_ROLE_ID,
	PermissionCollection,
	RoleCollection,
	RoleModel,
	RoleSchema,
	zodCreate,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager, ReturnedProperties } from "@zmaj-js/orm"
import { v4 } from "uuid"
import { OnCrudEvent } from "../../crud/on-crud-event.decorator"

/**
 * Service that keeps roles in permissions in memory so we can have easy access
 * without querying database on every request
 *
 * This service is in charge of having data synchronized with database (it listens to CRUD events)
 */
@Injectable()
export class AuthorizationState implements OnModuleInit {
	/** Current version of roles and permissions */
	cacheVersion = v4()

	/** All roles */
	roles: Record<string, ReturnedProperties<RoleModel, { $fields: true; permissions: true }>> = {}

	private rolesRepo: OrmRepository<RoleModel>

	constructor(private readonly repoManager: RepoManager) {
		this.rolesRepo = this.repoManager.getRepo(RoleModel)
	}

	/**
	 * Get roles and permissions and keep them in memory for fast access
	 * This also ensures that Public and Admin role exist.
	 * On every app startup if roles do not exist, insert them
	 */
	async onModuleInit(): Promise<void> {
		await this.updateRoles()
		await this.ensureRequiredRolesExist()
		this.cacheVersion = v4()
	}

	async updateRoles(): Promise<void> {
		const roles = await this.rolesRepo.findWhere({
			fields: { $fields: true, permissions: true }, //
		})
		this.roles = Object.fromEntries(roles.map((r) => [r.id, r] as const))
	}

	/**
	 * Ensure that Public and Admin roles exists
	 */
	private async ensureRequiredRolesExist(): Promise<void> {
		const publicRoleExist = this.roles[PUBLIC_ROLE_ID]
		const adminRoleExist = this.roles[ADMIN_ROLE_ID]

		if (!publicRoleExist) {
			await this.rolesRepo.createOne({
				data: zodCreate(RoleSchema.omit({ createdAt: true }), {
					name: "Public",
					description: "Public role",
					id: PUBLIC_ROLE_ID,
				}),
			})
		}

		if (!adminRoleExist) {
			await this.rolesRepo.createOne({
				data: zodCreate(RoleSchema.omit({ createdAt: true }), {
					name: "Admin",
					description: "Administrator role",
					id: ADMIN_ROLE_ID,
				}),
			})
		}

		// Update roles if changed. No need for permissions, cause they will be empty
		if (!adminRoleExist || !publicRoleExist) {
			await this.updateRoles()
		}
	}

	/**
	 * When role change, we need to fetch updated data.
	 * There aren't many roles and permissions, so it's best to simply fetch all of them in memory
	 * It is a lot easier then having to fetch new data every time
	 */
	@OnCrudEvent({ type: "after", collection: RoleCollection })
	async __onRoleChange(event: CrudAfterEvent): Promise<void> {
		if (event.action === "read") return

		await this.onModuleInit()
	}

	/**
	 * When permission change, we need to fetch updated data.
	 * There aren't many roles and permissions, so it's best to simply fetch all of them in memory
	 * It is a lot easier then having to fetch new data every time
	 */
	@OnCrudEvent({ type: "after", collection: PermissionCollection })
	async __onPermissionChange(event: CrudAfterEvent): Promise<void> {
		if (event.action === "read") return

		await this.onModuleInit()
	}

	/**
	 * Refresh every 30 minutes, just in case.
	 * Maybe user manually changed db without restarting the app
	 */
	@Cron(CronExpression.EVERY_30_MINUTES)
	async __refresh(): Promise<void> {
		await this.onModuleInit()
	}
}
