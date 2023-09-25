import { Locator, Page } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import {
	CollectionMetadata,
	CollectionMetadataModel,
	RelationDef,
	snakeCase,
} from "@zmaj-js/common"
import { camel, title } from "radash"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajCrudPage } from "../../setup/ZmajCrudPage.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"
import { GlobalPageFx } from "../../setup/global.fx.js"

export class CollectionPageFx extends ZmajCrudPage {
	constructor(
		page: Page,
		private globalFx: GlobalPageFx,
	) {
		super(page, "/#/zmajCollectionMetadata")
	}
	override title: string = "Collections"

	get relationsTab(): Locator {
		return this.page.getByRole("tab", { name: "Relations" })
	}

	get fieldsTab(): Locator {
		return this.page.getByRole("tab", { name: "Fields" })
	}

	get addRelationButton(): Locator {
		return this.globalFx.button("Add relation")
	}

	get addFieldButton(): Locator {
		return this.globalFx.button("Add field")
	}

	get linkInSidebar(): Locator {
		return this.globalFx.sidebarLink("Collections")
	}

	get tableNameInput(): Locator {
		return this.page.getByLabel("Table Name")
	}

	// relationInListByText(table1: string, property1: string, table2: string, type: string): Locator {
	// 	return this.page.getByRole("link", {
	// 		name: `${table1}.${property1} ⟶ ${table2} ${type}`,
	// 		exact: true,
	// 	})
	// }

	relationInListByDef(rel: RelationDef): Locator {
		return this.page.getByRole("link", {
			name: `${rel.tableName}.${rel.propertyName} ⟶ ${rel.otherSide.tableName} ${rel.type}`,
			exact: true,
		})
	}

	collectionInList(collection: string | { collectionName: string }): Locator {
		const name = typeof collection === "string" ? collection : collection.collectionName
		return this.page.getByRole("link", { name: `${name} Table:`, exact: false })
	}

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
	async deleteCollectionByTableName(tableName: string): Promise<void> {
		const exists = await this.repo.findOne({ where: { tableName } })
		if (!exists) return
		await this.sdk.infra.collections.deleteById({ id: exists.id })
	}

	async find(
		where: RepoFilterWhere<CollectionMetadataModel>,
	): Promise<CollectionMetadata | undefined> {
		return this.repo.findOne({ where })
	}
}
