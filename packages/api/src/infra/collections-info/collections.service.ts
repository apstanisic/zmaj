import { throw403, throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	CollectionCreateDto,
	CollectionMetadata,
	CollectionMetadataModel,
	CollectionMetadataSchema,
	CollectionUpdateDto,
	FieldMetadataModel,
	FieldMetadataSchema,
	UUID,
	zodCreate,
} from "@zmaj-js/common"
import { AlterSchemaService, OrmRepository, RepoManager } from "@zmaj-js/orm"
import { InfraStateService } from "../infra-state/infra-state.service"
import { InfraConfig } from "../infra.config"
import { OnInfraChangeService } from "../on-infra-change.service"

@Injectable()
export class CollectionsService {
	repo: OrmRepository<CollectionMetadataModel>
	fieldsRepo: OrmRepository<FieldMetadataModel>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly appInfraSync: OnInfraChangeService,
		private readonly alterSchema: AlterSchemaService,
		private readonly infraState: InfraStateService,
		private readonly infraConfig: InfraConfig,
	) {
		this.repo = this.repoManager.getRepo(CollectionMetadataModel)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataModel)
	}

	async createCollection(dto: CollectionCreateDto): Promise<CollectionMetadata> {
		return this.appInfraSync.executeChange(async () => {
			return this.repoManager.transaction({
				fn: async (trx) => {
					const created = await this.repo.createOne({
						trx,
						data: zodCreate(CollectionMetadataSchema.omit({ createdAt: true }), {
							...dto,
							collectionName: dto.collectionName ?? this.infraConfig.toCase(dto.tableName),
						}),
					})

					await this.fieldsRepo.createOne({
						trx,
						data: zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
							columnName: dto.pkColumn,
							tableName: dto.tableName,
							fieldName: this.infraConfig.toCase(dto.pkColumn),
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
