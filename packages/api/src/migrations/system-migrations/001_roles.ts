import { RoleModel } from "@zmaj-js/common"
import { DataTypes } from "sequelize"
import { createSystemMigration } from "../create-system-migration"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_roles"

export const CreateRolesTable = createSystemMigration({
	name: "2022_04_24_16_33_18__create_roles_table",
	up: async (_, { qi, trx, orm }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
				description: { type: DataTypes.STRING(500) },
				require_mfa: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
			},
			{ transaction: trx },
		)
		await qi.addIndex(table, ["created_at"], { transaction: trx })

		await orm.getRepo(RoleModel).createMany({
			trx: trx as any,
			data: [
				{
					description: "Administrator",
					id: "2ab853b2-a1a9-4ab7-a82b-a9f0005e4114",
					name: "Admin",
					requireMfa: false,
				},
				{
					description: "Public role",
					id: "534c05a3-f087-455d-bfeb-5b36c4d58c48",
					name: "Public",
					requireMfa: false,
				},
			],
		})
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
