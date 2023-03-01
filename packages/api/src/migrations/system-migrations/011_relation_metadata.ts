import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_relation_metadata"

export const CreateRelationMetadataTable = createSystemMigration({
	name: "2022_04_24_16_35_29__create_relation_metadata_tables",
	up: async (_, { trx, qi }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				table_name: {
					type: DataTypes.STRING(200),
					allowNull: false,
					references: { model: "zmaj_collection_metadata", key: "table_name" },
					onDelete: "CASCADE",
				},
				fk_name: { type: DataTypes.STRING(200), allowNull: false },
				mtm_fk_name: { type: DataTypes.STRING(200) },
				property_name: { type: DataTypes.STRING(200), allowNull: false },
				template: { type: DataTypes.STRING(400) },
				label: { type: DataTypes.STRING(200) },
				hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			},
			{
				transaction: trx,
				uniqueKeys: {
					zmaj_relation_metadata_table_name_fk_name_unique: { fields: ["table_name", "fk_name"] },
				},
			},
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
