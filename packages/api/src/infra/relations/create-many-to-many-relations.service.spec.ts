import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, InternalServerErrorException } from "@nestjs/common"
import { asMock, RelationCreateDto, isUUID, uuidRegex } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CreateManyToManyRelationsService } from "./create-many-to-many-relations.service"
import { JunctionRelationCreateDto } from "./expanded-relation-dto.types"

describe("CreateManyToManyRelationsService", () => {
	let service: CreateManyToManyRelationsService
	let schemaInfoS: SchemaInfoService
	let alterSchema: AlterSchemaService
	let dto: JunctionRelationCreateDto
	//
	beforeEach(async () => {
		const module = await buildTestModule(CreateManyToManyRelationsService).compile()
		service = module.get(CreateManyToManyRelationsService)
		alterSchema = module.get(AlterSchemaService)
		schemaInfoS = module.get(SchemaInfoService)

		dto = {
			junctionLeftColumn: "jlc",
			junctionLeftLabel: "jll",
			junctionLeftPropertyName: "jlp",
			junctionLeftTemplate: "jl_tp",
			junctionRightColumn: "jrc",
			junctionRightLabel: "jrl",
			junctionRightPropertyName: "jrp",
			junctionRightTemplate: "jr_tp",
			junctionTable: "jt",
			leftColumn: "id_l",
			leftFkName: "lfk",
			leftLabel: "ll",
			leftPkType: "uuid",
			leftPropertyName: "lp",
			leftTable: "lt",
			leftTemplate: "ltp",
			rightColumn: "id_r",
			rightFkName: "rfk",
			rightLabel: "rl",
			rightPkType: "uuid",
			rightPropertyName: "rp",
			rightTable: "rt",
			rightTemplate: "rtp",
			type: "many-to-many",
		}
	})

	describe("getJunctionPropertyName", () => {
		let dto: RelationCreateDto

		beforeEach(() => {
			dto = new RelationCreateDto({
				leftColumn: "post_id6",
				leftTable: "comments",
				rightTable: "posts",
				rightColumn: "id",
				type: "many-to-many",
				leftPropertyName: "postT",
				rightPropertyName: "commentsT",
			})
		})

		it("should throw if name is provided and taken", () => {
			dto.junctionLeftPropertyName = "id"
			expect(() => service["getJunctionPropertyName"](dto, "left")).toThrow(BadRequestException)
		})

		it("should return name if free", () => {
			dto.junctionLeftPropertyName = "freeProp"
			const res = service["getJunctionPropertyName"](dto, "left")
			expect(res).toEqual("freeProp")
		})

		it("should return first free name without number", () => {
			const res = service["getJunctionPropertyName"](dto, "left")
			expect(res).toEqual("comments")
		})

		it("should return proper side", () => {
			const res1 = service["getJunctionPropertyName"](dto, "left")
			expect(res1).toEqual("comments")

			const res2 = service["getJunctionPropertyName"](dto, "right")
			expect(res2).toEqual("posts")
		})

		it("should return first free name", () => {
			dto.leftTable = "id"
			const res = service["getJunctionPropertyName"](dto, "left")
			expect(res).toEqual("id2")
		})
	})

	describe("validateDtoWithSchema", () => {
		let dto: RelationCreateDto
		beforeEach(() => {
			dto = new RelationCreateDto({
				leftColumn: "lid",
				rightColumn: "lid",
				leftTable: "ltb",
				rightTable: "rtb",
				type: "many-to-many",
				leftPropertyName: "lpn",
				rightPropertyName: "rpn",
			})
			schemaInfoS.getPrimaryKey = vi.fn().mockResolvedValue({ columnName: "id", dataType: "uuid" })
			service["getJunctionTableName"] = vi.fn(async () => "jt")
			service["getJunctionPropertyName"] = vi.fn((dto, side) => {
				const provided =
					side === "left" ? dto.junctionLeftPropertyName : dto.junctionRightPropertyName
				return provided ?? `junction_prop_${side}`
			})
		})
		//

		it("should throw if table pks are invalid", async () => {
			asMock(schemaInfoS.getPrimaryKey).mockResolvedValue(false)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		})

		it("should use proper junction table name", async () => {
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.junctionTable).toEqual("jt")
		})

		it("should take pks from scheme", async () => {
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.leftColumn).toEqual("id")
			expect(res.rightColumn).toEqual("id")
		})

		it("should use provided data", async () => {
			//
			dto = {
				...dto,
				junctionLeftColumn: "q",
				junctionLeftLabel: "w",
				junctionLeftPropertyName: "e",
				junctionLeftTemplate: "r",
				junctionRightColumn: "t",
				junctionRightLabel: "y",
				junctionRightPropertyName: "a",
				junctionRightTemplate: "s",
				junctionTable: "jt",
				leftColumn: "d",
				leftFkName: "f",
				leftLabel: "g",
				leftPropertyName: "h",
				leftTable: "j",
				leftTemplate: "k",
				rightColumn: "l",
				rightFkName: "z",
				rightLabel: "x",
				rightPropertyName: "c",
				rightTable: "v",
				rightTemplate: "v",
				type: "many-to-many",
			}
			const res = await service["validateDtoWithSchema"](dto)
			expect(res).toEqual({
				junctionLeftColumn: "q",
				junctionLeftLabel: "w",
				junctionLeftPropertyName: "e",
				junctionLeftTemplate: "r",
				junctionRightColumn: "t",
				junctionRightLabel: "y",
				junctionRightPropertyName: "a",
				junctionRightTemplate: "s",
				junctionTable: "jt",
				leftColumn: expect.any(String),
				leftFkName: "f",
				leftLabel: "g",
				leftPkType: "uuid",
				leftPropertyName: "h",
				leftTable: "j",
				leftTemplate: "k",
				rightColumn: expect.any(String),
				rightFkName: "z",
				rightLabel: "x",
				rightPkType: "uuid",
				rightPropertyName: "c",
				rightTable: "v",
				rightTemplate: "v",
				type: "many-to-many",
			})
		})

		it("should fill missing data", async () => {
			const res = await service["validateDtoWithSchema"](dto)
			expect(res).toEqual({
				junctionLeftColumn: "ltb_id",
				junctionLeftLabel: "Ltb",
				junctionLeftPropertyName: "junction_prop_left",
				junctionLeftTemplate: null,
				junctionRightColumn: "rtb_id",
				junctionRightLabel: "Rtb",
				junctionRightPropertyName: "junction_prop_right",
				junctionRightTemplate: null,
				junctionTable: "jt",
				leftColumn: "id",
				leftFkName: "jt_ltb_id_foreign",
				leftLabel: "Rtb",
				leftPkType: "uuid",
				leftPropertyName: "lpn",
				leftTable: "ltb",
				leftTemplate: null,
				rightColumn: "id",
				rightFkName: "jt_rtb_id_foreign",
				rightLabel: "Ltb",
				rightPkType: "uuid",
				rightPropertyName: "rpn",
				rightTable: "rtb",
				rightTemplate: null,
				type: "many-to-many",
			})
			//
		})
	})

	describe("getJunctionTableName", () => {
		let dto: Pick<RelationCreateDto, "junctionTable" | "leftTable" | "rightTable">
		//
		beforeEach(() => {
			dto = { leftTable: "l_table", rightTable: "r_table", junctionTable: undefined }
			schemaInfoS.hasTable = vi.fn().mockResolvedValue(false)
		})

		it("should throw if table is specified and already exist", async () => {
			asMock(schemaInfoS.hasTable).mockResolvedValue(true)
			await expect(
				service["getJunctionTableName"]({ ...dto, junctionTable: "hello" }),
			).rejects.toThrow(BadRequestException)
		})

		it("should return specified table name if table is free ", async () => {
			const res = await service["getJunctionTableName"]({ ...dto, junctionTable: "hello" })
			expect(res).toEqual("hello")
		})

		it("should append uuid after 100 tries with int", async () => {
			schemaInfoS.hasTable = vi.fn().mockResolvedValue(true)
			const res = await service["getJunctionTableName"](dto)
			expect(res).toMatch("l_table_r_table_")
			expect(isUUID(res.replace("l_table_r_table_", ""))).toBe(true)
		})

		it("should not append anything if table name is free without suffix", async () => {
			const res = await service["getJunctionTableName"](dto)
			expect(res).toBe("l_table_r_table")
		})

		it("should append first free suffix", async () => {
			schemaInfoS.hasTable = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true)

			const res = await service["getJunctionTableName"](dto)
			expect(res).toBe("l_table_r_table_3")
		})
	})

	describe("modifySchema", () => {
		let dto: JunctionRelationCreateDto
		beforeEach(() => {
			dto = {
				leftTable: "lt",
				leftColumn: "lc",
				rightTable: "rt",
				rightColumn: "rc",
				junctionTable: "jt",
				junctionLeftColumn: "jlc",
				junctionRightColumn: "jrc",
				leftPkType: "uuid",
				rightPkType: "int",
				leftFkName: "l_fk",
				rightFkName: "r_fk",
			} as Partial<JunctionRelationCreateDto> as any

			alterSchema.createColumn = vi.fn()
			alterSchema.createFk = vi.fn()
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

			expect(alterSchema.createFk).nthCalledWith(1, {
				fkColumn: "jlc",
				fkTable: "jt",
				referencedTable: "lt",
				referencedColumn: "lc",
				indexName: "l_fk",
				trx: "TRX_1",
			})

			expect(alterSchema.createFk).nthCalledWith(2, {
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
			dto.leftTable = "zmaj_test"
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
			dto.rightTable = "zmaj_test"
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
