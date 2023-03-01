import { EntityRef } from "../crud-types/entity-ref.type"
import { Permission } from "../permissions/permission.model"
import { User } from "../users/user.model"

export type Role = {
	id: string
	name: string
	description: string | null
	createdAt: Date

	users?: EntityRef<User>[]
	permissions?: EntityRef<Permission>[]
}
