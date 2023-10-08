import { throw500 } from "@api/common/throw-http"
import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { Injectable, Logger } from "@nestjs/common"
import { DbMigrationModel } from "@zmaj-js/common"
import { SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { isString } from "radash"
import { MigrationError, Umzug } from "umzug"
import { MigrationsConfig } from "./migrations.config"
import {
	MigrationDefinition,
	MigrationFn,
	MigrationRunnerContext,
	SystemMigration,
	UserMigration,
} from "./migrations.types"
import { MigrationsUmzugStorage } from "./migrations.umzug-storage"
import { CreateMigrationsTable } from "./system-migrations/000_migrations"
import { systemMigrations } from "./system-migrations/mod"

/**
 */
@Injectable()
export class MigrationsService {
	logger = new Logger(MigrationsService.name)
	constructor(
		private storage: MigrationsUmzugStorage,
		private schemaInfo: SchemaInfoService,
		private orm: BootstrapOrm,
		private config: MigrationsConfig,
		private sqService: SequelizeService,
	) {}

	async sync(): Promise<void> {
		if (!this.config.autoRunMigrations) return

		await this.ensureMigrationsTableExist()
		await this.runSystemMigrations()

		if (this.config.autoRunUserMigrations) {
			await this.runUserMigrations()
		}
	}

	async ensureMigrationsTableExist(): Promise<void> {
		await this.orm.transaction({
			type: "SERIALIZABLE",
			fn: async (trx) => {
				const done = await this.schemaInfo.hasTable({
					trx,
					table: new DbMigrationModel().getTableName(),
				})
				if (done) return
				await this.executeMigration({ type: "system", trx: trx }, CreateMigrationsTable.up)
			},
		})
	}

	async runSystemMigrations(): Promise<void> {
		await this.runMigrations("system", systemMigrations.concat())
	}

	async runUserMigrations(): Promise<void> {
		await this.runMigrations("user", this.config.migrations)
	}

	async runMigrations(type: "system", migrations: readonly SystemMigration[]): Promise<void>
	async runMigrations(type: "user", migrations: readonly UserMigration[]): Promise<void>
	async runMigrations(
		type: "system" | "user",
		migrations: readonly MigrationDefinition[],
	): Promise<void> {
		await this.ensureMigrationsTableExist()
		await this.orm
			.transaction({
				fn: async (trx) => {
					const runner = new Umzug<MigrationRunnerContext>({
						storage: this.storage,
						logger: this.config.logging ? console : undefined,
						context: { type, trx: trx },
						migrations: migrations.map((m) => ({
							name: m.name,
							up: async ({ context }) => this.executeMigration(context, m.up),
							down: async ({ context }) => this.executeMigration(context, m.down),
						})),
					})

					return runner.up()
				},
			})
			.catch((e: MigrationError) => {
				this.logger.error("Problem running migrations")
				this.logger.error(e.message)
				this.logger.error(e)
				throw e.cause ?? throw500(4292102)
			})
	}

	private async executeMigration(
		ctx: MigrationRunnerContext,
		migration?: string | MigrationFn,
	): Promise<void> {
		if (!migration) return
		const executeStringMigration = async (val: string): Promise<void> => {
			await this.orm.rawQuery(val, { trx: ctx.trx })
		}

		if (isString(migration)) {
			await executeStringMigration(migration)
		} else {
			await migration(executeStringMigration, {
				databaseType: "postgres",
				trx: ctx.trx,
				orm: this.orm,
				qi: this.sqService.orm.getQueryInterface(),
			})
		}
	}
}
