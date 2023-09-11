import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import {
	CollectionDef,
	JunctionRelationCreateDto2,
	RelationCreateDto,
	asMock,
	uuidRegex,
} from "@zmaj-js/common"
import { AlterSchemaService, SchemaInfoService } from "@zmaj-js/orm"
import { CollectionDefStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { CreateManyToManyRelationsService } from "./create-many-to-many-relations.service"

describe("CreateManyToManyRelationsService", () => {
	let service: CreateManyToManyRelationsService
	let schemaInfoS: SchemaInfoService
	let alterSchema: AlterSchemaService
	let dto: JunctionRelationCreateDto2
	let infraState: InfraStateService

	//
	beforeEach(async () => {
		const module = await buildTestModule(CreateManyToManyRelationsService).compile()
		service = module.get(CreateManyToManyRelationsService)
		alterSchema = module.get(AlterSchemaService)
		schemaInfoS = module.get(SchemaInfoService)
		infraState = module.get(InfraStateService)

		dto = {
			junction: {
				left: {
					column: "jlc",
					label: "jll",
					propertyName: "jlp",
					template: "jl_tp",
				},
				right: {
					column: "jrc",
					label: "jrl",
					propertyName: "jrp",
					template: "jr_tp",
				},
				table: "jt",
			},
			left: {
				column: "id_l",
				fkName: "lfk",
				label: "ll",
				pkType: "uuid",
				propertyName: "lp",
				table: "lt",
				template: "ltp",
				collectionName: "lt",
			},
			right: {
				column: "id_r",
				fkName: "rfk",
				label: "rl",
				pkType: "uuid",
				propertyName: "rp",
				table: "rt",
				template: "rtp",
				collectionName: "rt",
			},
			type: "many-to-many",
		}
	})

	describe("validateDtoWithSchema", () => {
		let dto: RelationCreateDto
		let leftCol: CollectionDef
		let rightCol: CollectionDef
		beforeEach(() => {
			leftCol = CollectionDefStub({ pkColumn: "l_id" })
			rightCol = CollectionDefStub({ pkColumn: "r_id" })
			dto = new RelationCreateDto({
				left: {
					column: "lid",
					propertyName: "lpn",
				},
				right: {
					column: "rid",
					propertyName: "rpn",
				},
				leftCollection: leftCol.collectionName,
				rightCollection: rightCol.collectionName,
				type: "many-to-many",
			})
			schemaInfoS.getPrimaryKey = vi.fn().mockResolvedValue({ columnName: "id", dataType: "uuid" })
			service["getJunctionTableName"] = vi.fn(async () => "jt")
			infraState["_collections"] = {
				[leftCol.collectionName]: leftCol, //
				[rightCol.collectionName]: rightCol, //
			}
			service["getFreeFkName"] = vi.fn(async () => v4())
			// service["getJunctionTableName"] = vi.fn((dto, side) => {
			// 	const provided =
			// 		side === "left" ? dto.junctionLeftPropertyName : dto.junctionRightPropertyName
			// 	return provided ?? `junction_prop_${side}`
			// })
		})
		//

		// it("should throw if table pks are invalid", async () => {
		// 	await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		// })

		it("should use proper junction table name", async () => {
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.junction.table).toEqual("jt")
		})

		it("should take pks from scheme", async () => {
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.left.column).toEqual(leftCol.pkColumn)
			expect(res.right.column).toEqual(rightCol.pkColumn)
			//
			expect(res.left.column).not.toEqual(dto.left.column)
			expect(res.right.column).not.toEqual(dto.right.column)
		})

		it("should fill missing data", async () => {
			dto.fkName = "fk123"
			dto.junction ??= {}
			dto.junction.fkName = "fk456"
			const res = await service["validateDtoWithSchema"](dto)
			expect(res).toEqual({
				junction: {
					left: {
						column: leftCol.tableName + "_id",
						label: null,
						propertyName: leftCol.collectionName,
						template: null,
					},
					right: {
						column: rightCol.tableName + "_id",
						label: null,
						propertyName: rightCol.collectionName,
						template: null,
					},
					table: "jt",
				},
				left: {
					collectionName: leftCol.collectionName,
					column: leftCol.pkColumn,
					// mock is generating uuid
					fkName: "fk123",
					pkType: leftCol.fields[leftCol.pkField]!.dbRawDataType,
					propertyName: "lpn",
					table: leftCol.tableName,
				},
				right: {
					collectionName: rightCol.collectionName,
					column: rightCol.pkColumn,
					fkName: "fk456",
					pkType: rightCol.fields[rightCol.pkField]!.dbRawDataType,
					propertyName: "rpn",
					table: rightCol.tableName,
				},
				type: "many-to-many",
			} satisfies JunctionRelationCreateDto2)
			//
		})
	})

	describe("getJunctionTableName", () => {
		let leftCol: CollectionDef
		let rightCol: CollectionDef
		let collections: [CollectionDef, CollectionDef]
		//
		beforeEach(() => {
			leftCol = CollectionDefStub({ tableName: "qwerty" })
			rightCol = CollectionDefStub({ tableName: "asdf" })
			collections = [leftCol, rightCol]
			schemaInfoS.hasTable = vi.fn().mockResolvedValue(false)
		})

		it("should throw if table is specified and already exist", async () => {
			asMock(schemaInfoS.hasTable).mockResolvedValue(true)
			await expect(
				service["getJunctionTableName"]({ collections, junctionTable: "hello" }),
			).rejects.toThrow(BadRequestException)
		})

		it("should return specified table name if table is free ", async () => {
			const res = await service["getJunctionTableName"]({ collections, junctionTable: "hello" })
			expect(res).toEqual("hello")
		})

		it("should append last part of uuid after 30 tries with int", async () => {
			schemaInfoS.hasTable = vi.fn().mockResolvedValue(true)
			const res = await service["getJunctionTableName"]({ collections })
			expect(res).toMatch("qwerty_asdf_")
			expect(res).toHaveLength(12 + "qwerty_asdf_".length)
			// expect(isUUID(res.replace("l_table_r_table_", ""))).toBe(true)
		})

		it("should not append anything if table name is free without suffix", async () => {
			const res = await service["getJunctionTableName"]({ collections })
			expect(res).toBe("qwerty_asdf")
		})

		it("should append first free suffix", async () => {
			schemaInfoS.hasTable = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true)

			const res = await service["getJunctionTableName"]({ collections })
			expect(res).toBe("qwerty_asdf_3")
		})
	})

	describe("modifySchema", () => {
		let dto: JunctionRelationCreateDto2
		beforeEach(() => {
			dto = {
				type: "many-to-many",
				left: {
					table: "lt",
					column: "lc",
					collectionName: "lcl",
					fkName: "l_fk",
					pkType: "uuid",
					propertyName: "lpn",
					label: "ll",
					template: "lt",
				},
				right: {
					table: "rt",
					column: "rc",
					collectionName: "rcl",
					fkName: "r_fk",
					pkType: "int",
					propertyName: "rpn",
					label: "rl",
					template: "rt",
				},
				junction: {
					left: { column: "jlc", propertyName: "jlp" }, //
					right: { column: "jrc", propertyName: "rlp" }, //
					table: "jt",
				},
			}

			alterSchema.createColumn = vi.fn()
			alterSchema.createForeignKey = vi.fn()
			alterSchema.createTable = vi.fn()
			alterSchema.createUniqueKey = vi.fn()
		})

		it("should run proper commands", async () => {
			await service["modifySchema"](dto, "TRX_1" as any)

			expect(alterSchema.createTable).toBeCalledWith({
				pkColumn: "id",
				pkType: "auto-increment",
				tableName: "jt",
				trx: "TRX_1",
			})

			expect(alterSchema.createColumn).nthCalledWith(1, {
				columnName: "jlc",
				tableName: "jt",
				dataType: { type: "specific", value: "uuid" },
				trx: "TRX_1",
			})
			expect(alterSchema.createColumn).nthCalledWith(2, {
				columnName: "jrc",
				tableName: "jt",
				dataType: { type: "specific", value: "int" },
				trx: "TRX_1",
			})

			expect(alterSchema.createForeignKey).nthCalledWith(1, {
				fkColumn: "jlc",
				fkTable: "jt",
				referencedTable: "lt",
				referencedColumn: "lc",
				indexName: "l_fk",
				trx: "TRX_1",
			})

			expect(alterSchema.createForeignKey).nthCalledWith(2, {
				fkColumn: "jrc",
				fkTable: "jt",
				referencedTable: "rt",
				referencedColumn: "rc",
				indexName: "r_fk",
				trx: "TRX_1",
			})

			expect(alterSchema.createUniqueKey).toBeCalledWith({
				tableName: "jt",
				columnNames: ["jlc", "jrc"],
				trx: "TRX_1",
			})
		})
	})

	describe("saveRelationsToDb", () => {
		const createOne = vi.fn()
		const createMany = vi.fn()
		beforeEach(() => {
			service["relationsRepo"].createOne = createOne
			service["relationsRepo"].createMany = createMany
		})
		//
		it("should throw if left table is system", async () => {
			dto.left.table = "zmaj_test"
			await expect(service["saveRelationsToDb"]({ dto, trx: "TRX_1" as any })).rejects.toThrow(
				InternalServerErrorException,
			)
		})
		it("should create left relation", async () => {
			await service["saveRelationsToDb"]({ dto, trx: "TRX_1" as any })
			expect(createOne).nthCalledWith(1, {
				trx: "TRX_1",
				data: {
					// collectionId: colId,
					createdAt: expect.any(Date),
					fkName: "lfk",
					hidden: false,
					id: expect.stringMatching(uuidRegex),
					label: "ll",
					mtmFkName: "rfk",
					propertyName: "lp",
					tableName: "lt",
					template: "ltp",
				},
			})
		})
		it("should create junction relations", async () => {
			await service["saveRelationsToDb"]({ dto, trx: "TRX_1" as any })
			expect(createMany).toBeCalledWith({
				trx: "TRX_1",
				data: [
					{
						// collectionId: jId,
						createdAt: expect.any(Date),
						fkName: "lfk",
						hidden: false,
						id: expect.stringMatching(uuidRegex),
						label: "jll",
						mtmFkName: null,
						propertyName: "jlp",
						tableName: "jt",
						template: "jl_tp",
					},
					{
						// collectionId: jId,
						createdAt: expect.any(Date),
						fkName: "rfk",
						hidden: false,
						id: expect.stringMatching(uuidRegex),
						label: "jrl",
						mtmFkName: null,
						propertyName: "jrp",
						tableName: "jt",
						template: "jr_tp",
					},
				],
			})
			//
		})
		it("should create right relation if not system", async () => {
			await service["saveRelationsToDb"]({ dto, trx: "TRX_1" as any })
			expect(createOne).nthCalledWith(2, {
				trx: "TRX_1",
				data: {
					// collectionId: colId,
					createdAt: expect.any(Date),
					fkName: "rfk",
					hidden: false,
					id: expect.stringMatching(uuidRegex),
					label: "rl",
					mtmFkName: "lfk",
					propertyName: "rp",
					tableName: "rt",
					template: "rtp",
				},
			})
		})

		it("should not create right relation if system table", async () => {
			dto.right.table = "zmaj_test"
			await service["saveRelationsToDb"]({ dto, trx: "TRX_1" as any })
			expect(createOne).toBeCalledTimes(1)
		})

		it("should return left relation", async () => {
			asMock(createOne).mockResolvedValueOnce("leftRelation")

			const res = await service["saveRelationsToDb"]({
				dto,
				trx: "TRX_1" as any,
			})
			expect(res).toEqual("leftRelation")
			//
		})
	})
})
