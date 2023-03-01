import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_collection_metadata"

export const CreateCollectionMetadataTable = createSystemMigration({
	name: "2022_04_24_16_35_03__create_collection_metadata_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				table_name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
				disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				label: { type: DataTypes.STRING(200) },
				hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				display_template: { type: DataTypes.STRING(1000) },
				layout_config: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
