import { EntityRef } from "../crud-types/entity-ref.type"
import { Struct } from "../../types"
import { Role } from "../roles/role.model"

/**
 * Permission
 */
export type Permission = {
	/**
	 * Id
	 */
	readonly id: string
	/**
	 * When is permission created
	 */
	readonly createdAt: Date
	/**
	 * Action that is allowed
	 */
	action: string
	/**
	 * What resource is allowed. It can be db table, but it also can be anything else
	 */
	resource: string
	/**
	 * All allowed field
	 *
	 * If value is null, all fields are allowed.
	 * Applies only if it's table
	 */
	fields: readonly string[] | null
	/**
	 * Conditions under which user can access resource
	 */
	conditions: Struct | null
	/**
	 * Role ID that this permission belongs to
	 */
	roleId: string
	/**
	 * Joined role object
	 */
	role?: EntityRef<Role>
}
