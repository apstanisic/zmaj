import { Locator, expect } from "@playwright/test"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import {
	CollectionCreateDto,
	CollectionMetadata,
	CollectionMetadataModel,
	RelationCreateDto,
	RelationDef,
	RelationMetadata,
	RelationMetadataModel,
	escapeRegExp,
} from "@zmaj-js/common"
import { Orm, OrmRepository, RepoFilterWhere } from "zmaj"
import { ZmajPage } from "../../setup/ZmajPage.js"
import { getRandomTableName } from "../../setup/e2e-unique-id.js"

export class RelationPage extends ZmajPage {
	get joinMtmButton(): Locator {
		return this.page.getByRole("button", { name: "Join M2M" })
	}

	get confirmButton(): Locator {
		return this.page.getByRole("button", { name: "Confirm" })
	}

	get splitMtmButton(): Locator {
		return this.page.getByRole("button", { name: "Split M2M" })
	}

	async isOnRelationShowPage(id: string): Promise<void> {
		await expect(this.page).toHaveURL(
			new RegExp(escapeRegExp(`#/zmajRelationMetadata/${id}/show`)), //
		)
	}
}

export class RelationUtilsFx {
	constructor(
		private orm: Orm,
		private sdk: ZmajSdk,
	) {}

	get repo(): OrmRepository<RelationMetadataModel> {
		return this.orm.repoManager.getRepo(RelationMetadataModel)
	}

	get collectionRepo() {
		return this.orm.repoManager.getRepo(CollectionMetadataModel)
	}

	async createCollections(): Promise<[CollectionMetadata, CollectionMetadata]> {
		const c1 = await this.sdk.infra.collections.createOne({
			data: new CollectionCreateDto({
				tableName: getRandomTableName(),
			}),
		})
		const c2 = await this.sdk.infra.collections.createOne({
			data: new CollectionCreateDto({
				tableName: getRandomTableName(),
			}),
		})
		return [c1, c2]
	}

	async findWhere(
		where: RepoFilterWhere<RelationMetadataModel>,
	): Promise<RelationMetadata | undefined> {
		return this.repo.findOne({ where })
	}

	async removeCollections(cols: [CollectionMetadata, CollectionMetadata]): Promise<void> {
		const [col1, col2] = cols
		if (await this.orm.schemaInfo.hasTable({ table: col1.tableName })) {
			await this.sdk.infra.collections.deleteById({ id: col1.id })
		}
		if (await this.orm.schemaInfo.hasTable({ table: col2.tableName })) {
			await this.sdk.infra.collections.deleteById({ id: col2.id })
		}
	}

	async removeCollectionByTableName(name: string): Promise<void> {
		await this.orm.alterSchema.dropTable({ tableName: name })
		await this.sdk.system.refresh()
	}

	async createRelation(data: RelationCreateDto): Promise<RelationDef> {
		return this.sdk.infra.relations.createOne({ data })
	}
}
