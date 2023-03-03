import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "sequelize"
import { Role } from "@zmaj-js/common"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_roles"

export const CreateRolesTable = createSystemMigration({
	name: "2022_04_24_16_33_18__create_roles_table",
	up: async (_, { qi, trx, repoManager }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
				description: { type: DataTypes.STRING(500) },
			},
			{ transaction: trx },
		)
		await qi.addIndex(table, ["created_at"], { transaction: trx })

		await repoManager.getRepo<Role>(table).createMany({
			trx: trx as any,
			data: [
				{
					description: "Administrator",
					id: "2ab853b2-a1a9-4ab7-a82b-a9f0005e4114",
					name: "Admin",
				},
				{
					description: "Public role",
					id: "534c05a3-f087-455d-bfeb-5b36c4d58c48",
					name: "Public",
				},
			],
		})
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
