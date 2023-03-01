import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { PUBLIC_ROLE_ID } from "@zmaj-js/common"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_users"

export const CreateUsersTable = createSystemMigration(
	{
		name: "2022_04_24_16_33_50__create_users_table",
		up: async (_, { qi, trx }) => {
			await qi.createTable(
				table,
				{
					...getRequiredColumns(),
					email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
					password: { type: DataTypes.STRING(1000), allowNull: false },
					confirmed_email: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
					role_id: {
						type: DataTypes.UUID,
						allowNull: false,
						defaultValue: PUBLIC_ROLE_ID,
						references: { model: "zmaj_roles", key: "id" },
						onDelete: "SET DEFAULT",
					},
					first_name: { type: DataTypes.STRING(200) },
					last_name: { type: DataTypes.STRING(200) },
					status: { type: DataTypes.STRING(200), allowNull: false, defaultValue: "disabled" },
					// token is encrypted, add more space for it
					otp_token: { type: DataTypes.STRING(500) },
				},
				{ transaction: trx },
			)
		},
		down: async (_, { trx, qi }) => {
			await qi.dropTable(table, { transaction: trx, cascade: true })
		},
	}, //
)
