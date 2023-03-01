import { Except } from "type-fest"
import { SystemMigration } from "./migrations.types"

export function createSystemMigration(params: Except<SystemMigration, "type">): SystemMigration {
	return { ...params, type: "system" }
}
