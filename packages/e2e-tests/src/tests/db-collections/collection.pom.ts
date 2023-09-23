import { ZmajSdk } from "@zmaj-js/client-sdk"
import { CollectionMetadata, CollectionMetadataModel, snakeCase } from "@zmaj-js/common"
import { camel, title } from "radash"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

export class CollectionPageFx extends ZmajCrudPage {
	override title: string = "Collections"

	async goToCollectionShow(col: CollectionMetadata): Promise<void> {
		await this.page
			.getByRole("link", { name: `${col.collectionName} Table: "${col.tableName}"` })
			.click()
	}
}

export class CollectionUtilsFx {
	constructor(
		private orm: Orm,
		private sdk: ZmajSdk,
	) {}

	get repo(): OrmRepository<CollectionMetadataModel> {
		return this.orm.repoManager.getRepo(CollectionMetadataModel)
	}

	async createCollection(
		collectionName: string = camel(getRandomTableName()),
	): Promise<CollectionMetadata> {
		const tableName = snakeCase(collectionName)
		return this.sdk.infra.collections.createOne({
			data: {
				pkColumn: "id",
				pkType: "uuid",
				tableName,
				label: title(tableName),
				collectionName,
			},
		})
	}

	async deleteCollection(collection: CollectionMetadata): Promise<void> {
		const exists = await this.repo.findOne({ where: { id: collection.id } })
		if (!exists) return
		await this.sdk.infra.collections.deleteById({ id: collection.id })
	}

	async find(
		where: RepoFilterWhere<CollectionMetadataModel>,
	): Promise<CollectionMetadata | undefined> {
		return this.repo.findOne({ where })
	}
}
