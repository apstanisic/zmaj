import { createSystemMigration } from "../create-system-migration"
import { DataTypes } from "@sequelize/core"
import { getRequiredColumns } from "../migrations.utils"

const table = "zmaj_webhooks"

export const CreateWebhooksTable = createSystemMigration({
	name: "2022_04_24_16_34_23__create_webhooks_table",
	up: async (_, { qi, trx }) => {
		await qi.createTable(
			table,
			{
				...getRequiredColumns(),
				url: { type: DataTypes.STRING(1000), allowNull: false },
				name: { type: DataTypes.STRING(200), allowNull: false, defaultValue: "Webhook" },
				description: { type: DataTypes.STRING(1000) },
				http_method: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "GET" },
				enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				events: {
					type: DataTypes.ARRAY(DataTypes.STRING(200)),
					allowNull: false,
					defaultValue: [],
				},
				send_data: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				http_headers: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
			},
			{ transaction: trx },
		)
	},
	down: async (_, { trx, qi }) => {
		await qi.dropTable(table, { transaction: trx, cascade: true })
	},
})
