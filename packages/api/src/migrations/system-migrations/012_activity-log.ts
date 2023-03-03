import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_activity_log"

export const CreateActivityLogTable = createSystemMigration({
	name: "2022_04_24_16_35_40__create_activity_log_table",
	up: async (_, { trx, qi }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				user_id: {
					type: DataTypes.UUID,
					references: { key: "id", model: "zmaj_users" },
					onDelete: "SET NULL",
				},
				action: { type: DataTypes.STRING(200), allowNull: false },
				resource: { type: DataTypes.STRING(300), allowNull: false },
				ip: { type: DataTypes.STRING(200), allowNull: false },
				user_agent: { type: DataTypes.STRING(300) },
				comment: { type: DataTypes.STRING(200) },
				item_id: { type: DataTypes.STRING(200) },
				additional_info: { type: DataTypes.JSONB },
				changes: { type: DataTypes.JSONB },
				previous_data: { type: DataTypes.JSONB },
				embedded_user_info: { type: DataTypes.JSONB },
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
