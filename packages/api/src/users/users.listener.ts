import { throw403 } from "@api/common/throw-http"
import type { DeleteStartEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { ADMIN_ROLE_ID, User, UserCollection } from "@zmaj-js/common"
import { UsersService } from "./users.service"

@Injectable()
export class UsersListener {
	constructor(private usersService: UsersService) {}

	/**
	 * Prevents deleting last admin user
	 */
	@OnCrudEvent({ action: "delete", collection: UserCollection, type: "start" })
	async __ensureAdminRemaining(event: DeleteStartEvent<User>): Promise<void> {
		const deletingAdmin = event.toDelete.some((u) => u.original.roleId === ADMIN_ROLE_ID)
		if (!deletingAdmin) return
		const ids = event.toDelete.map((u) => u.id) as string[]
		const remainingAdmins = await this.usersService.repo.count({
			where: { roleId: ADMIN_ROLE_ID, id: { $nin: ids } },
		})
		if (remainingAdmins < 1) throw403(99038, emsg.cantDeleteLastAdmin)
	}

	/**
	 * Only admin can delete other admin users
	 */
	@OnCrudEvent({ action: "delete", collection: UserCollection, type: "before" })
	async __preventNonAdminDeletingAdmin(event: DeleteStartEvent<User>): Promise<void> {
		if (event.user?.roleId === ADMIN_ROLE_ID) return
		const hasAdmin = event.toDelete.some((user) => user.original.roleId !== ADMIN_ROLE_ID)
		if (hasAdmin) throw403(387900, emsg.noAuthz)
	}
}
