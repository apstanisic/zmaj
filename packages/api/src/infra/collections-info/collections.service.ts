import { throw403, throw404 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	CollectionCreateDto,
	CollectionMetadata,
	CollectionMetadataCollection,
	CollectionMetadataSchema,
	CollectionUpdateDto,
	FieldMetadata,
	FieldMetadataCollection,
	FieldMetadataSchema,
	UUID,
	zodCreate,
} from "@zmaj-js/common"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"

@Injectable()
export class CollectionsService {
	repo: OrmRepository<CollectionMetadata>
	fieldsRepo: OrmRepository<FieldMetadata>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly appInfraSync: OnInfraChangeService,
		private readonly alterSchema: AlterSchemaService,
		private readonly infraState: InfraStateService,
	) {
		this.repo = this.repoManager.getRepo(CollectionMetadataCollection)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataCollection)
	}

	async createCollection(dto: CollectionCreateDto): Promise<CollectionMetadata> {
		return this.appInfraSync.executeChange(async () => {
			return this.repoManager.transaction({
				fn: async (trx) => {
					const created = await this.repo.createOne({
						trx,
						data: zodCreate(CollectionMetadataSchema, dto),
					})

					await this.fieldsRepo.createOne({
						trx,
						data: zodCreate(FieldMetadataSchema, {
							columnName: dto.pkColumn,
							tableName: dto.tableName,
						}),
					})

					await this.alterSchema.createTable({
						pkColumn: dto.pkColumn,
						pkType: dto.pkType,
						tableName: dto.tableName,
						trx,
					})

					return created
				},
			})
		})
	}

	async removeCollection(collectionId: UUID): Promise<CollectionMetadata> {
		const col = this.infraState.getCollection(collectionId)
		if (!col) throw404(379993, emsg.noCollection)

		const hasFk = Object.values(col.relations).some(
			(r) => r.type === "one-to-many" || r.type === "many-to-many" || r.type === "ref-one-to-one",
		)

		// pg throws error unless i cascade, IDK if i want to do that, since it's inconsistent
		// mysql has no options, it's forbidden, sql allowed, ignores fk, pg allows with cascade
		if (hasFk) throw403(18843, emsg.cantDeleteTableHasFk)

		return this.appInfraSync.executeChange(() => {
			return this.repoManager.transaction({
				fn: async (trx) => {
					const deleted = await this.repo.deleteById({ trx, id: collectionId })
					await this.alterSchema.dropTable({ tableName: deleted.tableName, trx })
					return deleted
				},
			})
		})
	}

	async updateCollection(id: UUID, data: CollectionUpdateDto): Promise<CollectionMetadata> {
		return this.appInfraSync.executeChange(async () => this.repo.updateById({ id, changes: data }))
	}
}
