import { faker } from "@faker-js/faker"
import { Page } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { CollectionMetadata, FieldCreateDto, FieldMetadata, snakeCase } from "@zmaj-js/common"
import { camel, title } from "radash"
import { Orm } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

export class FieldPage extends ZmajPage {
	constructor(
		page: Page,
		orm: Orm,
		protected sdk: ZmajSdk,
	) {
		super(page, orm, "/#/")
	}

	async goToCollectionsList(): Promise<void> {
		await this.page.getByRole("link", { name: "Collections" }).click()
		await this.toHaveUrl("zmajCollectionMetadata")
	}

	async goToCollectionsShow(collection: CollectionMetadata): Promise<void> {
		await this.page.getByRole("link", { name: collection.collectionName }).click()
		await this.toHaveUrl(`zmajCollectionMetadata/${collection.id}/show`)
	}

	async goToFieldsTab(): Promise<void> {
		await this.page.getByRole("tab", { name: "Fields" }).click()
	}

	async isOnFieldShowPage(id: string): Promise<void> {
		await this.toHaveUrl(`/zmajFieldMetadata/${id}/show`)
	}

	async goToSpecificField(field: FieldMetadata): Promise<void> {
		await this.page.getByRole("link", { name: `Column: "${field.columnName}"` }).click()
		await this.toHaveUrl(`zmajFieldMetadata/${field.id}/show`)
	}

	async clickFieldEditButton(field: FieldMetadata): Promise<void> {
		await this.page.getByRole("button", { name: /Edit/ }).click()
		await this.toHaveUrl(`/zmajFieldMetadata/${field.id}`)
	}

	db = {
		createCollectionAndField: async (
			field: FieldCreateDto,
		): Promise<{ field: FieldMetadata; collection: CollectionMetadata }> => {
			const collection = await this.db.createCollection(field.collectionName)
			const created = await this.sdk.infra.fields.createOne({ data: field })
			return { field: created, collection }
		},
		createCollection: async (
			collectionName: string = camel(getRandomTableName()),
		): Promise<CollectionMetadata> => {
			const tableName = snakeCase(collectionName)
			return this.sdk.infra.collections.createOne({
				data: {
					pkColumn: "id",
					pkType: "auto-increment",
					tableName,
					label: title(tableName),
					collectionName,
				},
			})
		},
		createRandomCollectionAndField: async (data: Partial<FieldCreateDto> = {}) => {
			return this.db.createCollectionAndField(
				new FieldCreateDto({
					collectionName: camel(getRandomTableName()),
					columnName: faker.database.column(),
					dataType: faker.helpers.arrayElement(["boolean", "text", "date"]),
					isNullable: faker.datatype.boolean(),
					...data,
				}),
			)
		},
		deleteCollection: async (collection: CollectionMetadata) => {
			await this.sdk.infra.collections.deleteById({ id: collection.id })
		},
	}
}
