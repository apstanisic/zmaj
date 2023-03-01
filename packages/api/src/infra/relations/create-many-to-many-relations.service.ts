import { throw400, throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	CollectionMetadata,
	CollectionMetadataCollection,
	CollectionMetadataSchema,
	FieldMetadata,
	FieldMetadataCollection,
	FieldMetadataSchema,
	RelationMetadata,
	RelationMetadataCollection,
	RelationCreateDto,
	RelationMetadataSchema,
	zodCreate,
} from "@zmaj-js/common"
import { camel, title } from "radash"
import { v4 } from "uuid"
import { JunctionRelationCreateDto } from "./expanded-relation-dto.types"

@Injectable()
export class CreateManyToManyRelationsService {
	constructor(
		private schemaInfo: SchemaInfoService,
		private repoManager: RepoManager,
		private alterSchema: AlterSchemaService, // private infraState: InfraStateService,
	) {
		this.relationsRepo = this.repoManager.getRepo(RelationMetadataCollection)
		this.collectionsRepo = this.repoManager.getRepo(CollectionMetadataCollection)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataCollection)
	}

	private relationsRepo: OrmRepository<RelationMetadata>
	private collectionsRepo: OrmRepository<CollectionMetadata>
	private fieldsRepo: OrmRepository<FieldMetadata>

	private async validateDtoWithSchema(dto: RelationCreateDto): Promise<JunctionRelationCreateDto> {
		const leftTablePk = await this.schemaInfo.getPrimaryKey(dto.leftTable)
		const rightTablePk = await this.schemaInfo.getPrimaryKey(dto.rightTable)

		// Both tables must have pk for m2m to work
		if (!leftTablePk) throw400(52254, emsg.noPk(dto.leftTable))
		if (!rightTablePk) throw400(52554, emsg.noPk(dto.rightTable))

		const junctionTable = await this.getJunctionTableName(dto)
		const junctionLeftColumn = dto.junctionLeftColumn ?? `${dto.leftTable}_id`
		const junctionRightColumn = dto.junctionRightColumn ?? `${dto.rightTable}_id`

		return {
			junctionTable,
			junctionLeftColumn,
			junctionRightColumn,
			leftColumn: leftTablePk.columnName,
			rightColumn: rightTablePk.columnName,
			type: "many-to-many",
			leftLabel: dto.leftLabel ?? title(dto.rightTable),
			rightLabel: dto.rightLabel ?? title(dto.leftTable),
			// should be handled
			leftPropertyName: dto.leftPropertyName ?? throw500(43289),
			// should be handled
			rightPropertyName: dto.rightPropertyName ?? throw500(79532),
			leftTable: dto.leftTable,
			rightTable: dto.rightTable,
			leftTemplate: dto.leftTemplate ?? null,
			rightTemplate: dto.rightTemplate ?? null,
			leftFkName: dto.leftFkName ?? `${junctionTable}_${junctionLeftColumn}_foreign`,
			rightFkName: dto.rightFkName ?? `${junctionTable}_${junctionRightColumn}_foreign`,
			leftPkType: leftTablePk.dataType,
			rightPkType: rightTablePk.dataType,
			// junctionLeftPropertyName: dto.junctionLeftPropertyName ?? camel(dto.leftTable),
			junctionLeftLabel: dto.junctionLeftLabel ?? title(dto.leftTable),
			junctionLeftPropertyName: this.getJunctionPropertyName(dto, "left"),
			junctionLeftTemplate: dto.junctionLeftTemplate ?? null,
			// junctionRightPropertyName: dto.junctionRightPropertyName ?? camel(dto.rightTable),
			junctionRightLabel: dto.junctionRightLabel ?? title(dto.rightTable),
			junctionRightPropertyName: this.getJunctionPropertyName(dto, "right"),
			junctionRightTemplate: dto.junctionRightTemplate ?? null,
		}
	}

	getJunctionPropertyName(dto: RelationCreateDto, side: "left" | "right"): string {
		const propertyName =
			side === "left" ? dto.junctionLeftPropertyName : dto.junctionRightPropertyName

		// this points to main table on the side where junction property name is
		const table = side === "left" ? dto.leftTable : dto.rightTable

		const takenProperties = [
			camel(dto.leftColumn),
			camel(dto.rightColumn),
			camel("id"), //
		]

		if (propertyName) {
			if (takenProperties.includes(propertyName)) throw400(342999, emsg.propertyTaken(propertyName))
			return propertyName
		}

		for (let i = 1; i < 5; i++) {
			const name = camel(table) + (i === 1 ? "" : i)
			if (!takenProperties.includes(name)) return name
		}
		// will never happen
		throw500(3729432)
	}

	private async getJunctionTableName(
		dto: Pick<RelationCreateDto, "junctionTable" | "leftTable" | "rightTable">,
	): Promise<string> {
		// if user provided table name, we will never try to override it
		// so we throw if it's takes
		if (dto.junctionTable) {
			const exist = await this.schemaInfo.hasTable(dto.junctionTable)
			if (exist) throw400(5392864, emsg.collectionExists(dto.junctionTable))
			return dto.junctionTable
		}

		const baseName = `${dto.leftTable}_${dto.rightTable}`

		for (let i = 1; i < 100; i++) {
			const name = baseName + (i === 1 ? "" : `_${i}`)
			const exist = await this.schemaInfo.hasTable(name)
			if (!exist) return name
		}
		return `${baseName}_${v4()}`
	}

	private async modifySchema(dto: JunctionRelationCreateDto, trx: Transaction): Promise<void> {
		await this.alterSchema.createTable(
			{
				pkColumn: "id",
				pkType: "auto-increment",
				tableName: dto.junctionTable,
			},
			{ trx },
		)

		await this.alterSchema.createColumn(
			{
				columnName: dto.junctionLeftColumn,
				tableName: dto.junctionTable,
				dataType: { type: "specific", value: dto.leftPkType },
			},
			{ trx },
		)

		await this.alterSchema.createColumn(
			{
				columnName: dto.junctionRightColumn,
				tableName: dto.junctionTable,
				dataType: { type: "specific", value: dto.rightPkType },
			},
			{ trx },
		)

		await this.alterSchema.createFk(
			{
				fkColumn: dto.junctionLeftColumn,
				fkTable: dto.junctionTable,
				referencedTable: dto.leftTable,
				referencedColumn: dto.leftColumn,
				indexName: dto.leftFkName,
			},
			{ trx },
		)

		await this.alterSchema.createFk(
			{
				fkColumn: dto.junctionRightColumn,
				fkTable: dto.junctionTable,
				referencedTable: dto.rightTable,
				referencedColumn: dto.rightColumn,
				indexName: dto.rightFkName,
			},
			{ trx },
		)

		await this.alterSchema.createUniqueKey(
			{
				tableName: dto.junctionTable,
				columnNames: [dto.junctionLeftColumn, dto.junctionRightColumn],
			},
			{ trx },
		)
	}

	private async saveRelationsToDb({
		dto,
		trx,
	}: {
		dto: JunctionRelationCreateDto
		trx: Transaction
	}): Promise<RelationMetadata> {
		// zod should this catch already
		if (dto.leftTable.startsWith("zmaj")) throw500(53498)

		const mainRelation = await this.relationsRepo.createOne({
			trx,
			data: zodCreate(RelationMetadataSchema, {
				tableName: dto.leftTable,
				// collectionId,
				fkName: dto.leftFkName,
				label: dto.leftLabel,
				propertyName: dto.leftPropertyName,
				template: dto.leftTemplate,
				mtmFkName: dto.rightFkName,
			}),
		})

		if (!dto.rightTable.startsWith("zmaj")) {
			// const collectionId = this.infraState.findCollection(dto.rightTable)?.id ?? throw500(789532)
			await this.relationsRepo.createOne({
				trx,
				data: zodCreate(RelationMetadataSchema, {
					tableName: dto.rightTable,
					// collectionId,
					fkName: dto.rightFkName,
					label: dto.rightLabel,
					propertyName: dto.rightPropertyName,
					template: dto.rightTemplate,
					mtmFkName: dto.leftFkName,
				}),
			})
		}

		await this.relationsRepo.createMany({
			trx,
			data: [
				zodCreate(RelationMetadataSchema, {
					tableName: dto.junctionTable,
					// collectionId: junctionCollectionId,
					fkName: dto.leftFkName,
					label: dto.junctionLeftLabel,
					propertyName: dto.junctionLeftPropertyName,
					template: dto.junctionLeftTemplate,
				}),
				zodCreate(RelationMetadataSchema, {
					tableName: dto.junctionTable,
					// collectionId: junctionCollectionId,
					fkName: dto.rightFkName,
					label: dto.junctionRightLabel,
					propertyName: dto.junctionRightPropertyName,
					template: dto.junctionRightTemplate,
				}),
			],
		})
		return mainRelation
	}

	async createCollectionAndFields(dto: JunctionRelationCreateDto, trx: Transaction): Promise<void> {
		await this.collectionsRepo.createOne({
			trx,
			data: zodCreate(CollectionMetadataSchema, {
				tableName: dto.junctionTable,
				hidden: true,
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema, {
				columnName: "id",
				tableName: dto.junctionTable,
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema, {
				columnName: dto.junctionLeftColumn,
				tableName: dto.junctionTable,
			}),
		})

		await this.fieldsRepo.createOne({
			trx,
			data: zodCreate(FieldMetadataSchema, {
				columnName: dto.junctionRightColumn,
				tableName: dto.junctionTable,
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
}
