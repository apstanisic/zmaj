import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { QueryInterface } from "sequelize"
import { DbMigrationName } from "@zmaj-js/common"

export type MigrationRunnerContext = {
	trx?: Transaction
	type: "system" | "user"
}

type ExecuteSql = (query: string) => Promise<void>

type MigrationFnOptions = {
	repoManager: BootstrapRepoManager
	trx: Transaction | any
	qi: QueryInterface
	databaseType: "postgres"
}

export type MigrationFn = (execute: ExecuteSql, services: MigrationFnOptions) => Promise<void>

export type MigrationDefinition = {
	name: DbMigrationName
	up: string | MigrationFn
	down?: string | MigrationFn
}

export type UserMigration = MigrationDefinition & { type: "user" }
export type SystemMigration = MigrationDefinition & { type: "system" }

/**
 * Helper factory to define system migration
 * Main use case is to help with typings
 */
