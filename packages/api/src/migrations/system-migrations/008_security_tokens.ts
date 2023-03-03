import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_security_tokens"
export const CreateSecurityTokensTable = createSystemMigration({
	name: "2022_04_24_16_34_51__create_security_tokens_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				token: { type: DataTypes.STRING(500), allowNull: false },
				valid_until: { type: DataTypes.DATE(3) },
				used_for: { type: DataTypes.STRING(200), allowNull: false },
				data: { type: DataTypes.STRING(5000) },
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: "zmaj_users",
						key: "id",
					},
					onDelete: "CASCADE",
				},
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
