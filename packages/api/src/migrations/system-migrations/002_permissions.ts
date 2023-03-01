import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_permissions"

export const CreatePermissionsTable = createSystemMigration({
	name: "2022_04_24_16_33_35__create_permissions_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				role_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { key: "id", model: "zmaj_roles" },
					onDelete: "CASCADE",
				},
				action: { type: DataTypes.STRING(200), allowNull: false },
				resource: { type: DataTypes.STRING(200), allowNull: false },
				fields: { type: DataTypes.ARRAY(DataTypes.STRING(200)) },
				conditions: { type: DataTypes.JSONB },
			},
			{
				transaction: trx,
				uniqueKeys: {
					zmaj_permissions_role_id_action_resource: {
						fields: ["role_id", "action", "resource"],
					},
				},
			},
		)
	},
	// down,

	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
