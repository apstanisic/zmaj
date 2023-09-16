import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	CollectionDef,
	CollectionMetadataModel,
	CollectionMetadataSchema,
	FieldMetadataModel,
	FieldMetadataSchema,
	JunctionRelationCreateDto2,
	RelationCreateDto,
	RelationMetadata,
	RelationMetadataModel,
	RelationMetadataSchema,
	zodCreate,
} from "@zmaj-js/common"
import {
	AlterSchemaService,
	OrmRepository,
	RepoManager,
	SchemaInfoService,
	Transaction,
} from "@zmaj-js/orm"
import { v4 } from "uuid"
import { InfraStateService } from "../infra-state/infra-state.service"
import { InfraConfig } from "../infra.config"

@Injectable()
export class CreateManyToManyRelationsService {
	constructor(
		private schemaInfo: SchemaInfoService,
		private repoManager: RepoManager,
		private alterSchema: AlterSchemaService,
		private infraState: InfraStateService,
		private config: InfraConfig,
	) {
		this.relationsRepo = this.repoManager.getRepo(RelationMetadataModel)
		this.collectionsRepo = this.repoManager.getRepo(CollectionMetadataModel)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataModel)
	}

	private relationsRepo: OrmRepository<RelationMetadataModel>
	private collectionsRepo: OrmRepository<CollectionMetadataModel>
	private fieldsRepo: OrmRepository<FieldMetadataModel>

	private async validateDtoWithSchema(dto: RelationCreateDto): Promise<JunctionRelationCreateDto2> {
		const leftCol =
			this.infraState.getCollection(dto.leftCollection) ?? throw400(8333, emsg.noCollection)
		const rightCol =
			this.infraState.getCollection(dto.rightCollection) ?? throw400(99542, emsg.noCollection)

		const junctionLeftColumn = dto.junction?.left?.column ?? `${leftCol.tableName}_id`
		const junctionRightColumn = dto.junction?.right?.column ?? `${rightCol.tableName}_id`
		const junctionTable = await this.getJunctionTableName({
			collections: [leftCol, rightCol],
			junctionTable: dto.junction?.tableName,
		})

		return {
			type: "many-to-many",
			junction: {
				table: junctionTable,
				left: {
					propertyName: dto.junction?.left?.propertyName ?? dto.leftCollection,
					label: dto.junction?.left?.label ?? null,
					template: dto.junction?.left?.template ?? null,
					column: junctionLeftColumn,
				},
				right: {
					label: dto.junction?.right?.label ?? null,
					propertyName: dto.junction?.right?.propertyName ?? dto.rightCollection,
					template: dto.junction?.right?.template ?? null,
					column: junctionRightColumn,
				},
			},
			left: {
				...dto.left,
				table: leftCol.tableName,
				collectionName: leftCol.collectionName,
				column: leftCol.pkColumn,
				fkName: dto.fkName ?? (await this.getFreeFkName(leftCol.tableName, dto.left.column)),
				pkType: leftCol.fields[leftCol.pkField]?.dbRawDataType ?? throw500(379993),
			},
			right: {
				...dto.right,
				table: rightCol.tableName,
				column: rightCol.pkColumn,
				collectionName: rightCol.collectionName,
				fkName:
					dto.junction?.fkName ?? (await this.getFreeFkName(rightCol.tableName, dto.right.column)),
				pkType: rightCol.fields[rightCol.pkField]?.dbRawDataType ?? throw500(379993),
			},
		}
	}

	private async getJunctionTableName(params: {
		junctionTable?: string | null
		collections: [CollectionDef, CollectionDef]
	}): Promise<string> {
		if (params.junctionTable) {
			const exist = await this.schemaInfo.hasTable({ table: params.junctionTable })
			if (exist) throw400(5392864, emsg.collectionExists(params.junctionTable))
			return params.junctionTable
		}

		const baseName = `${params.collections[0].tableName}_${params.collections[1].tableName}`

		for (let i = 1; i < 30; i++) {
			const name = baseName + (i === 1 ? "" : `_${i}`)
			const exist = await this.schemaInfo.hasTable({ table: name })
			if (!exist) return name
		}
		return `${baseName}_${v4().substring(24)}`
	}

	private async modifySchema(dto: JunctionRelationCreateDto2, trx: Transaction): Promise<void> {
		await this.alterSchema.createTable({
			pkColumn: "id",
			pkType: "auto-increment",
			tableName: dto.junction.table,
			trx,
		})

		await this.alterSchema.createColumn({
			columnName: dto.junction.left.column,
			tableName: dto.junction.table,
			dataType: { type: "specific", value: dto.left.pkType },
			trx,
		})

		await this.alterSchema.createColumn({
			columnName: dto.junction.right.column,
			tableName: dto.junction.table,
			dataType: { type: "specific", value: dto.right.pkType },
			trx,
		})

		await this.alterSchema.createForeignKey({
			fkTable: dto.junction.table,
			fkColumn: dto.junction.left.column,
			referencedTable: dto.left.table,
			referencedColumn: dto.left.column,
			indexName: dto.left.fkName,
			trx,
		})

		await this.alterSchema.createForeignKey({
			fkTable: dto.junction.table,
			fkColumn: dto.junction.right.column,
			referencedTable: dto.right.table,
			referencedColumn: dto.right.column,
			indexName: dto.right.fkName,
			trx,
		})

		await this.alterSchema.createUniqueKey({
			tableName: dto.junction.table,
			columnNames: [dto.junction.left.column, dto.junction.right.column],
			trx,
		})
	}

	private async saveRelationsToDb({
		dto,
		trx,
	}: {
		dto: JunctionRelationCreateDto2
		trx: Transaction
	}): Promise<RelationMetadata> {
		// zod should this catch already
		if (dto.left.table.startsWith("zmaj")) throw500(53498)

		const mainRelation = await this.relationsRepo.createOne({
			trx,
			data: zodCreate(RelationMetadataSchema.omit({ createdAt: true }), {
				tableName: dto.left.table,
				// collectionId,
				fkName: dto.left.fkName,
				label: dto.left.label,
				propertyName: dto.left.propertyName,
				template: dto.left.template,
				mtmFkName: dto.right.fkName,
			}),
		})

		if (!dto.right.table.startsWith("zmaj")) {
			// const collectionId = this.infraState.findCollection(dto.rightTable)?.id ?? throw500(789532)
			await this.relationsRepo.createOne({
				trx,
				data: zodCreate(RelationMetadataSchema.omit({ createdAt: true }), {
					tableName: dto.right.table,
					// collectionId,
					fkName: dto.right.fkName,
					label: dto.right.label,
					propertyName: dto.right.propertyName,
					template: dto.right.template,
					mtmFkName: dto.left.fkName,
				}),
			})
		}

		await this.relationsRepo.createMany({
			trx,
			data: [
				zodCreate(RelationMetadataSchema.omit({ createdAt: true }), {
					tableName: dto.junction.table,
					// collectionId: junctionCollectionId,
					fkName: dto.left.fkName,
					label: dto.junction.left.label,
					propertyName: dto.junction.left.propertyName,
					template: dto.junction.left.template,
				}),
				zodCreate(RelationMetadataSchema.omit({ createdAt: true }), {
					tableName: dto.junction.table,
					// collectionId: junctionCollectionId,
					fkName: dto.right.fkName,
					label: dto.junction.right.label,
					propertyName: dto.junction.right.propertyName,
					template: dto.junction.right.template,
				}),
			],
		})
		return mainRelation
	}

	async createCollectionAndFields(
		dto: JunctionRelationCreateDto2,
		trx: Transaction,
	): Promise<void> {
		await this.collectionsRepo.createOne({
			trx,
			data: zodCreate(CollectionMetadataSchema.omit({ createdAt: true }), {
				tableName: dto.junction.table,
				collectionName: this.config.toCase(dto.junction.table),
				hidden: true,
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
				columnName: "id",
				tableName: dto.junction.table,
				fieldName: "id",
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
				columnName: dto.junction.left.column,
				tableName: dto.junction.table,
				fieldName: this.config.toCase(dto.junction.left.column),
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema.omit({ createdAt: true }), {
				columnName: dto.junction.right.column,
				tableName: dto.junction.table,
				fieldName: this.config.toCase(dto.junction.right.column),
			}),
		})
	}

	async createRelation(data: RelationCreateDto): Promise<RelationMetadata> {
		const dto = await this.validateDtoWithSchema(data)

		return this.repoManager.transaction({
			fn: async (trx) => {
				await this.modifySchema(dto, trx)
				await this.createCollectionAndFields(dto, trx)
				const mainRelation = await this.saveRelationsToDb({ trx, dto })
				return mainRelation
			},
		})
	}
	async getFreeFkName(table: string, column: string, trx?: Transaction): Promise<string> {
		const allKeys = await this.schemaInfo.getForeignKeys({ trx })
		let i = 1
		while (i < 30) {
			const keyName = `${table}_${column}${i > 1 ? "_" + i : ""}`
			const taken = allKeys.some((k) => k.fkName === keyName)
			if (!taken) return keyName
			i += 1
		}
		return `fk_${v4().substring(24)}`
	}
}
