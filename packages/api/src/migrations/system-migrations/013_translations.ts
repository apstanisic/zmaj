import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_translations"

export const CreateTranslationsTable = createSystemMigration({
	name: "2022_04_24_16_35_51__create_translations_table",
	up: async (_, { trx, qi }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				collection_name: {
					type: DataTypes.STRING(200),
					allowNull: false,
					references: { model: "zmaj_collection_metadata", key: "table_name" },
					onDelete: "CASCADE",
				},
				language: { type: DataTypes.STRING(100), allowNull: false },
				item_id: { type: DataTypes.STRING(200), allowNull: false },
				translations: { type: DataTypes.JSONB, allowNull: false },
			},
			{
				transaction: trx,
				uniqueKeys: {
					zmaj_translations_collection_name_language_item_id: {
						fields: ["collection_name", "item_id", "language"],
					},
				},
			},
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
