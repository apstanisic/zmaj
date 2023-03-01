import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_files"

export const CreateFilesTable = createSystemMigration({
	name: "2022_04_24_16_34_11__create_files_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				file_size: { type: DataTypes.INTEGER, allowNull: false },
				folder_path: { type: DataTypes.STRING(1000), allowNull: false, defaultValue: "/" }, // add index
				uri: { type: DataTypes.STRING(1000), allowNull: false },
				storage_provider: { type: DataTypes.STRING(200), allowNull: false },
				name: { type: DataTypes.STRING(200) },
				extension: { type: DataTypes.STRING(100) },
				description: { type: DataTypes.STRING(1000) },
				mime_type: { type: DataTypes.STRING(200) },
				user_id: {
					type: DataTypes.UUID,
					references: {
						model: "zmaj_users",
						key: "id",
					},
					onDelete: "SET NULL",
				},
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
