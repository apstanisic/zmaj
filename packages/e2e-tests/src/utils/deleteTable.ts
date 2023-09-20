import { CollectionMetadataModel } from "@zmaj-js/common"
import { getOrm } from "../setup/e2e-orm.js"
import { getSdk } from "./getSdk.js"

async function deleteTable(tableName: string): Promise<void> {
	const orm = await getOrm()

	await orm.repoManager.transaction({
		fn: async (trx) => {
			await orm.repoManager
				.getRepo(CollectionMetadataModel)
				.deleteWhere({ where: { tableName }, trx })
			const exists = await orm.schemaInfo.hasTable({ table: tableName, trx })
			if (exists) {
				await orm.alterSchema.dropTable({ tableName, trx })
			}
		},
	})
	await getSdk().client.get("/refresh", {})
}

export async function deleteTables(...tables: string[]): Promise<void> {
	for (const table of tables) {
		await deleteTable(table)
	}
}
