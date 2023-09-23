import { faker } from "@faker-js/faker"
import { Page } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import {
	CollectionMetadata,
	FieldCreateDto,
	FieldMetadata,
	FieldMetadataModel,
	FieldUpdateDto,
} from "@zmaj-js/common"
import { camel } from "radash"
import { Orm, OrmRepository } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"
import { getUniqueColumnName } from "../../setup/e2e-unique-id.js"

export class FieldPage extends ZmajPage {
	constructor(
		page: Page,
		protected sdk: ZmajSdk,
	) {
		super(page, "/#/")
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
}

export class FieldUtilsFx {
	constructor(
		private orm: Orm,
		private sdk: ZmajSdk,
	) {}

	get repo(): OrmRepository<FieldMetadataModel> {
		return this.orm.repoManager.getRepo(FieldMetadataModel)
	}

	async createField(
		collection: CollectionMetadata,
		data: Partial<FieldCreateDto> = {},
	): Promise<FieldMetadata> {
		const columnName = getUniqueColumnName()
		return this.sdk.infra.fields.createOne({
			data: new FieldCreateDto({
				collectionName: collection.collectionName,
				columnName,
				fieldName: camel(columnName),
				dataType: faker.helpers.arrayElement(["boolean", "text", "date"]),
				isNullable: faker.datatype.boolean(),
				...data,
			}),
		})
	}

	async deleteField(field: FieldMetadata): Promise<void> {
		const exist = await this.repo.findOne({ where: { id: field.id } })
		if (!exist) return
		await this.sdk.infra.fields.deleteById({ id: field.id })
	}

	async update(id: string, changes: FieldUpdateDto): Promise<FieldMetadata> {
		return this.repo.updateById({ id, changes })
	}
}
