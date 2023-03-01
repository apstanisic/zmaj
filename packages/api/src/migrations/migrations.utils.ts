import { NestExpressApplication } from "@nestjs/platform-express"
import { DataTypes, ModelAttributeColumnOptions, Sequelize } from "@sequelize/core"
import { MigrationsConfig } from "./migrations.config"
import { MigrationsService } from "./migrations.service"

/**
 * Used ONLY in CLI
 */
export async function runSystemMigrations(app: NestExpressApplication): Promise<void> {
	const config = app.get(MigrationsConfig)
	config.autoRunMigrations = true
	config.autoRunUserMigrations = true
	const service = app.get(MigrationsService)
	await service.sync()
	// await service.ensureMigrationsTableExist()
	// await service.runSystemMigrations()
}

export function getRequiredColumns(): Record<"id" | "created_at", ModelAttributeColumnOptions> {
	return {
		id: { type: DataTypes.UUID, primaryKey: true },
		created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DefaultNow },
	}
}

export const DefaultNow = Sequelize.fn("NOW")
