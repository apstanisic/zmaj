import { DataTypes } from "@sequelize/core"
import { createSystemMigration } from "../create-system-migration"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_field_metadata"

export const CreateFieldMetadataTable = createSystemMigration({
	name: "2022_04_24_16_35_18__create_field_metadata_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				column_name: { type: DataTypes.STRING(200), allowNull: false },
				table_name: {
					type: DataTypes.STRING(200),
					allowNull: false,
					references: {
						model: "zmaj_collection_metadata",
						key: "table_name",
					},
					onDelete: "CASCADE",
				},
				can_create: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
				can_update: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
				can_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
				sortable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
				// used for gui
				label: { type: DataTypes.STRING(200) },
				component_name: { type: DataTypes.STRING(200) },
				description: { type: DataTypes.STRING(500) },
				field_config: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
				//
				is_updated_at: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				is_created_at: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			},
			{ transaction: trx },
		)

		await qi.addConstraint(table, {
			type: "unique",
			fields: ["table_name", "column_name"],
			transaction: trx,
		})

		await qi.addIndex(table, ["table_name", "is_created_at"], {
			unique: true,
			where: { is_created_at: true },
			transaction: trx,
		})

		await qi.addIndex(table, ["table_name", "is_updated_at"], {
			unique: true,
			where: { is_updated_at: true },
			transaction: trx,
		})
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
