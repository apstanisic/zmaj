import { throw400, throw403, throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	FieldMetadata,
	FieldMetadataCollection,
	FieldMetadataSchema,
	RelationMetadata,
	RelationMetadataCollection,
	RelationCreateDto,
	RelationMetadataSchema,
	RelationDef,
	zodCreate,
} from "@zmaj-js/common"
import { title } from "radash"
import { InfraStateService } from "../infra-state/infra-state.service"
import { DirectRelationCreateDto } from "./expanded-relation-dto.types"

@Injectable()
export class DirectRelationService {
	private repo: OrmRepository<RelationMetadata>
	private fieldsRepo: OrmRepository<FieldMetadata>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly alterSchema: AlterSchemaService,
		private readonly schemaInfo: SchemaInfoService,
		private readonly infraState: InfraStateService,
	) {
		this.repo = this.repoManager.getRepo(RelationMetadataCollection)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataCollection)
	}

	/**
	 * New relation from controller
	 * We need access to db service for schema info
	 * It ensures that schema is okay, and that everything is possible to be created
	 */
	private async validateDtoWithSchema(dto: RelationCreateDto): Promise<DirectRelationCreateDto> {
		if (dto.type === "many-to-many") throw500(352342)
		// Tables must exists, we can't otherwise make FKs
		const leftTableExists = await this.schemaInfo.hasTable(dto.leftTable)
		const rightTableExists = await this.schemaInfo.hasTable(dto.rightTable)
		if (!rightTableExists || !leftTableExists) throw400(44901981, emsg.noCollection)

		if (dto.type === "one-to-many" || dto.type === "ref-one-to-one") {
			dto = this.reverseOneToManyDto(dto)
		}
		// just for ts
		if (dto.type !== "owner-one-to-one" && dto.type !== "many-to-one") throw500(973123)

		// can't modify system table
		if (dto.leftTable.startsWith("zmaj")) throw403(42392, emsg.isSystemTable)

		// can't create fk if other table does not have pk
		const rightPk = await this.schemaInfo.getPrimaryKey(dto.rightTable)
		if (!rightPk) throw403(9372423, emsg.noPk(dto.rightTable))

		const alreadyExist = await this.schemaInfo.hasColumn(dto.leftTable, dto.leftColumn)
		// we check if user provided fk column that already exist
		if (alreadyExist) throw400(51932, emsg.fieldExists(dto.leftColumn))

		return {
			leftColumn: dto.leftColumn,
			leftTable: dto.leftTable,
			rightTable: dto.rightTable,
			leftTemplate: dto.leftTemplate ?? null,
			rightTemplate: dto.rightTemplate ?? null,
			type: dto.type,
			rightColumn: rightPk.columnName,
			leftFkName: dto.leftFkName ?? `${dto.leftTable}_${dto.leftColumn}_foreign`,
			leftLabel: dto.leftLabel ?? title(dto.rightTable),
			// leftPropertyName: dto.leftPropertyName ?? camelCase(dto.rightTable),
			// it should never come to generated name, cause it should be generated in RelationsService,
			leftPropertyName: dto.leftPropertyName ?? throw500(324932),
			rightLabel: dto.rightLabel ?? title(dto.leftTable),
			// rightPropertyName: dto.rightPropertyName ?? camelCase(dto.leftTable),
			// it should never come to generated name, cause it should be generated in RelationsService,
			rightPropertyName: dto.rightPropertyName ?? throw500(32432),
			rightPkType: rightPk.dataType,
			onDelete: dto.onDelete ?? null,
		}
	}

	/**
	 * Reverse one-to-many to many-to-one, because then we have one less case for creating
	 * It also works on ref-one-to-one
	 */
	private reverseOneToManyDto(dto: RelationCreateDto): Omit<RelationCreateDto, "type"> & {
		type: "many-to-one" | "owner-one-to-one"
	} {
		if (dto.type !== "one-to-many" && dto.type !== "ref-one-to-one") throw500(42391)
		return {
			type: dto.type === "ref-one-to-one" ? "owner-one-to-one" : "many-to-one",
			leftColumn: dto.rightColumn,
			rightColumn: dto.leftColumn,
			leftTable: dto.rightTable,
			onDelete: dto.onDelete,
			rightTable: dto.leftTable,
			leftLabel: dto.rightLabel,
			leftPropertyName: dto.rightPropertyName,
			rightLabel: dto.leftLabel,
			rightPropertyName: dto.leftPropertyName,
			leftFkName: dto.leftFkName,
			leftTemplate: dto.rightTemplate,
			rightTemplate: dto.leftTemplate,
		}
	}

	async createRelation(data: RelationCreateDto): Promise<RelationMetadata> {
		const dto = await this.validateDtoWithSchema(data)
		// const collection = this.infraState.findCollection(dto.leftTable) ?? throw500(429083)

		return this.repoManager.transaction({
			fn: async (trx) => {
				await this.alterSchema.createColumn({
					columnName: dto.leftColumn,
					tableName: dto.leftTable,
					dataType: { type: "specific", value: dto.rightPkType },
					unique: dto.type === "owner-one-to-one",
					trx,
				})

				const fkName = `${dto.leftTable}_${dto.leftColumn}_foreign`

				await this.alterSchema.createFk({
					fkColumn: dto.leftColumn,
					fkTable: dto.leftTable,
					referencedTable: dto.rightTable,
					referencedColumn: dto.rightColumn,
					indexName: fkName,
					onDelete: dto.onDelete,
					trx,
				})

				const fkField = await this.fieldsRepo.createOne({
					trx,
					data: zodCreate(FieldMetadataSchema, {
						columnName: dto.leftColumn,
						tableName: dto.leftTable,
					}),
				})

				// if it was o2m, this is wrong relation to return to user
				// this relation should be returned to user, since he/she requested it from this side
				const rel1 = await this.repo.createOne({
					trx,
					data: zodCreate(RelationMetadataSchema, {
						fkName,
						label: dto.leftLabel,
						propertyName: dto.leftPropertyName,
						tableName: dto.leftTable,
						template: dto.leftTemplate,
						// collectionId: collection.id,
					}),
				})

				let rel2: RelationMetadata | undefined = undefined

				if (!dto.rightTable.startsWith("zmaj")) {
					rel2 = await this.repo.createOne({
						trx,
						data: zodCreate(RelationMetadataSchema, {
							fkName,
							label: dto.rightLabel,
							propertyName: dto.rightPropertyName,
							tableName: dto.rightTable,
							template: dto.rightTemplate,
							// collectionId: this.infraState.findCollection(dto.rightTable)?.id ?? throw500(429083),
						}),
					})
				}

				// if user provided this as o2m, we need to return o2m relation,
				// and o2m can never have left side as system table
				if (data.type === "one-to-many" || data.type === "ref-one-to-one") {
					return rel2 ?? throw500(932432)
				}
				return rel1
			},
		})
	}

	async deleteRelation(relation: RelationDef): Promise<void> {
		if (relation.type === "many-to-many") throw500(9237423)
		let fkCol: string
		let fkTable: string
		if (relation.type === "many-to-one" || relation.type === "owner-one-to-one") {
			fkCol = relation.columnName
			fkTable = relation.tableName
		} else {
			fkCol = relation.otherSide.columnName
			fkTable = relation.otherSide.tableName
		}
		if (fkTable.startsWith("zmaj")) throw403(890234, emsg.isSystemTable)

		await this.repoManager.transaction({
			fn: async (trx) => {
				await this.alterSchema.dropFk({
					fkColumn: fkCol,
					fkTable: fkTable,
					indexName: relation.relation.fkName,
					trx,
				})

				// delete all relations in db with this fk
				await this.repo.deleteWhere({ trx, where: { fkName: relation.relation.fkName } })
			},
		})
	}
}
