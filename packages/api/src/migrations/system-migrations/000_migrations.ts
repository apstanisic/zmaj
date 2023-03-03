import { DataTypes } from "sequelize"
import { createSystemMigration } from "../create-system-migration"

export const CreateMigrationsTable = createSystemMigration({
	name: "2022_04_24_16_32_18__create_migrations_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			"zmaj_migrations",
			{
				id: { type: DataTypes.UUID, primaryKey: true },
				name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
				type: { type: DataTypes.STRING(100), allowNull: false },
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable("zmaj_migrations", { transaction: trx, cascade: true })
	},
})
