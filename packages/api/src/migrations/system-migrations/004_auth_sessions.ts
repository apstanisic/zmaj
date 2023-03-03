import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { DefaultNow, getRequiredColumns } from "../migrations.utils"

const table = "zmaj_auth_sessions"

export const CreateAuthSessionsTable = createSystemMigration({
	name: "2022_04_24_16_34_02__create_auth_sessions_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { key: "id", model: "zmaj_users" },
					onDelete: "CASCADE",
				},
				refresh_token: { type: DataTypes.STRING(400), allowNull: false },
				last_used: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DefaultNow },
				valid_until: { type: DataTypes.DATE(3), allowNull: false },
				ip: { type: DataTypes.STRING(200), allowNull: false },
				user_agent: { type: DataTypes.STRING(400) },
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
