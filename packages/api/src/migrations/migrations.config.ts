import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MigrationDefinition, UserMigration } from "./migrations.types"
import { MODULE_OPTIONS_TOKEN } from "./migrations.module-definition"

const Schema = z.object({
	/**
	 * Should app run migrations on startup, and on infra change during runtime
	 */
	autoRunMigrations: z.boolean().default(false),

	autoRunUserMigrations: z.boolean().default(false),
	/**
	 * Should we log migration messages
	 */
	logging: z.boolean().default(false),
	/**
	 * Custom migrations. If provided, this migrations will be joined with dynamic migrations
	 * and executed
	 */
	migrations: z
		.array(z.custom<MigrationDefinition>())
		.default([])
		.transform((v) => v.map((m): UserMigration => ({ ...m, type: "user" }))),
	/**
	 * WIP
	 *
	 * When we create collection, field or relation, DB schema will be changed. Do you want to
	 * save command that were executed in database.
	 */
	// createDynamicMigrations: z.literal(false).default(false),
	/**
	 * WIP
	 */
	// runDynamicMigrations: z.literal(false).default(false),
})

export type MigrationsConfigParams = z.input<typeof Schema>

@Injectable()
export class MigrationsConfig extends ZodDto(Schema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: MigrationsConfigParams) {
		super(params)
	}
}
