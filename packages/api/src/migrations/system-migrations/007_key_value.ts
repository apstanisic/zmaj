import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { DefaultNow, getRequiredColumns } from "../migrations.utils"

const table = "zmaj_key_value"

export const CreateKeyValueTable = createSystemMigration({
	name: "2022_04_24_16_34_41__create_key_values_tables",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				key: { type: DataTypes.STRING(250), allowNull: false },
				// this stores json, but I still want to some abuse
				value: { type: DataTypes.STRING(10000) },
				namespace: { type: DataTypes.STRING(200) },
				updated_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DefaultNow },
			},
			{
				transaction: trx,
				uniqueKeys: {
					zmaj_key_value_key_namespace_index: { fields: ["key", "namespace"] }, //
				},
			},
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
