import { throw400, throw403, throw500 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	DirectRelationCreateDto2,
	DirectRelationCreateDto3,
	FieldMetadata,
	FieldMetadataCollection,
	FieldMetadataSchema,
	RelationCreateDto,
	RelationDef,
	RelationMetadata,
	RelationMetadataCollection,
	RelationMetadataSchema,
	zodCreate,
} from "@zmaj-js/common"
import { Except } from "type-fest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { Transaction } from "@api/database/orm-specs/Transaction"
import { v4 } from "uuid"
import { InfraConfig } from "../infra.config"

@Injectable()
export class DirectRelationService {
	private repo: OrmRepository<RelationMetadata>
	private fieldsRepo: OrmRepository<FieldMetadata>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly alterSchema: AlterSchemaService,
		private readonly schemaInfo: SchemaInfoService,
		private readonly infraState: InfraStateService,
		private readonly config: InfraConfig,
	) {
		this.repo = this.repoManager.getRepo(RelationMetadataCollection)
		this.fieldsRepo = this.repoManager.getRepo(FieldMetadataCollection)
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
	/**
	 * New relation from controller
	 * We need access to db service for schema info
	 * It ensures that schema is okay, and that everything is possible to be created
	 */
	private async validateDtoWithSchema(
		anyDto: RelationCreateDto,
	): Promise<DirectRelationCreateDto3> {
		if (anyDto.type === "many-to-many") throw500(352342)

		const dto = this.reverseIfOtm(anyDto)
		const leftCol =
			this.infraState.getCollection(dto.leftCollection) ?? throw400(37439, emsg.noCollection)
		const rightCol =
			this.infraState.getCollection(dto.rightCollection) ?? throw400(900231, emsg.noCollection)

		// can't modify system table
		if (leftCol.tableName.startsWith("zmaj")) throw403(42392, emsg.isSystemTable)

		const alreadyExist = await this.schemaInfo.hasColumn(leftCol.tableName, dto.left.column)
		// we check if user provided fk column that already exist
		if (alreadyExist) throw400(51932, emsg.fieldExists(dto.left.column))

		const fkName = dto.fkName ?? (await this.getFreeFkName(leftCol.tableName, dto.left.column))
		return {
			type: dto.type,
			left: {
				column: dto.left.column,
				propertyName: dto.left.propertyName,
				template: dto.left.template ?? null,
				label: dto.left.label ?? null,
				table: leftCol.tableName,
			},
			right: {
				column: rightCol.pkColumn,
				propertyName: dto.right.propertyName,
				template: dto.right.template ?? null,
				label: dto.right.label ?? null,
				table: rightCol.tableName,
			},
			fkName,
			pkType: rightCol.fields[rightCol.pkField]?.dbRawDataType ?? throw500(993499),
			onDelete: dto.onDelete,
			leftCollection: dto.leftCollection,
			rightCollection: dto.rightCollection,
		}
	}

	/**
	 * Reverse one-to-many to many-to-one, because then we have one less case for creating
	 * It also works on ref-one-to-one
	 */
	private reverseIfOtm(dto: Except<RelationCreateDto, "junction">): DirectRelationCreateDto2 {
		if (dto.type === "many-to-many") throw500(389999)

		if (dto.type === "many-to-one" || dto.type === "owner-one-to-one") {
			return { ...dto, type: dto.type }
		}
		return {
			type: dto.type === "ref-one-to-one" ? "owner-one-to-one" : "many-to-one",
			left: dto.right,
			right: dto.left,
			leftCollection: dto.rightCollection,
			onDelete: dto.onDelete,
			rightCollection: dto.leftCollection,
			fkName: dto.fkName,
		}
	}

	async createRelation(data: RelationCreateDto): Promise<RelationMetadata> {
		const dto = await this.validateDtoWithSchema(data)

		return this.repoManager.transaction({
			fn: async (trx) => {
				await this.alterSchema.createColumn({
					columnName: dto.left.column,
					tableName: dto.left.table,
					dataType: { type: "specific", value: dto.pkType },
					unique: dto.type === "owner-one-to-one",
					trx,
				})

				await this.alterSchema.createFk({
					fkColumn: dto.left.column,
					fkTable: dto.left.table,
					referencedTable: dto.right.table,
					referencedColumn: dto.right.column,
					indexName: dto.fkName,
					onDelete: dto.onDelete,
					trx,
				})

				const fkField = await this.fieldsRepo.createOne({
					trx,
					data: zodCreate(FieldMetadataSchema, {
						columnName: dto.left.column,
						tableName: dto.left.table,
						fieldName: this.config.toCase(dto.left.column),
					}),
				})

				// if it was o2m, this is wrong relation to return to user
				// this relation should be returned to user, since he/she requested it from this side
				const rel1 = await this.repo.createOne({
					trx,
					data: zodCreate(RelationMetadataSchema, {
						fkName: dto.fkName,
						label: dto.left.label,
						propertyName: dto.left.propertyName,
						tableName: dto.left.table,
						template: dto.left.template,
					}),
				})

				let rel2: RelationMetadata | undefined = undefined

				if (!dto.right.table.startsWith("zmaj")) {
					rel2 = await this.repo.createOne({
						trx,
						data: zodCreate(RelationMetadataSchema, {
							fkName: dto.fkName,
							label: dto.right.label,
							propertyName: dto.right.propertyName,
							tableName: dto.right.table,
							template: dto.right.template,
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
