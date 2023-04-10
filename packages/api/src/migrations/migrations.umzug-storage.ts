import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { OrmRepository } from "@zmaj-js/orm"
import { Injectable } from "@nestjs/common"
import { DbMigration, DbMigrationCollection } from "@zmaj-js/common"
import { SnakeCasedProperties } from "type-fest"
import { MigrationParams, UmzugStorage } from "umzug"
import { MigrationRunnerContext } from "./migrations.types"

export type SnakeCaseMigration = SnakeCasedProperties<DbMigration>
/**
 * We require that migration exists in table before it's run.
 * This is mainly because of dynamic migrations. Since all their data is stored in db,
 * we have to save up and down queries. But we can't pass that data to `logMigration`.
 * So we store migration in db beforehand, and tag it as not executed. And then simply run migrations.
 * For system migrations it's not needed, but it's simpler if we have same system for all migrations
 */
@Injectable()
export class MigrationsUmzugStorage implements UmzugStorage<MigrationRunnerContext> {
	repo: OrmRepository<DbMigration>
	constructor(private repoManager: BootstrapRepoManager) {
		this.repo = this.repoManager.getRepo(DbMigrationCollection)
	}

	/**
	 * When migration is done, log this
	 *
	 * @param params Standard Umzug params
	 */
	async logMigration(params: MigrationParams<MigrationRunnerContext>): Promise<void> {
		await this.repo.createOne({
			data: { name: params.name as DbMigration["name"], type: params.context.type },
			trx: params.context.trx,
		})
	}
	/**
	 * Umzug calls this function when we revert migrations
	 * It will set migration as not done
	 *
	 * @param params Standard Umzug params
	 */
	async unlogMigration(params: MigrationParams<MigrationRunnerContext>): Promise<void> {
		await this.repo.deleteWhere({
			where: { name: params.name as DbMigration["name"], type: params.context.type },
			trx: params.context.trx,
		})
	}

	/** List of executed migrations. Umzug user this to check migration is already done */
	async executed(
		params: Pick<MigrationParams<MigrationRunnerContext>, "context">,
	): Promise<string[]> {
		const migrations = await this.repo.findWhere({
			where: { type: params.context.type },
			orderBy: { name: "ASC" },
			trx: params.context.trx,
		})
		return migrations.map((v) => v.name)
	}
}
