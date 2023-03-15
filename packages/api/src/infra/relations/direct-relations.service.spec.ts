import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
} from "@nestjs/common"
import { asMock, RelationCreateDto, makeWritable, RelationDef } from "@zmaj-js/common"
import { RelationMetadataStub, RelationDefStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DirectRelationService } from "./direct-relations.service"
import { DirectRelationCreateDto } from "./expanded-relation-dto.types"

describe("DirectRelationsService", () => {
	let service: DirectRelationService
	let schemaInfoService: SchemaInfoService
	let alterSchemaService: AlterSchemaService
	//
	beforeEach(async () => {
		const module = await buildTestModule(DirectRelationService).compile()
		service = module.get(DirectRelationService)
		schemaInfoService = module.get(SchemaInfoService)
		alterSchemaService = module.get(AlterSchemaService)
	})

	describe("validateDtoWithSchema", () => {
		let dto: RelationCreateDto
		beforeEach(() => {
			dto = RelationCreateDto.fromPartial({
				leftTable: "lt",
				rightTable: "rt",
				leftColumn: "lc",
				rightColumn: "rc",
				leftPropertyName: "lpn",
				rightPropertyName: "rpn",
				type: "many-to-one",
			})
			schemaInfoService.hasTable = vi.fn().mockResolvedValue(true)

			schemaInfoService.getPrimaryKey = vi
				.fn()
				.mockResolvedValue({ columnName: "id", dataType: "uuid" })

			schemaInfoService.hasColumn = vi.fn().mockResolvedValue(false)
		})

		it("should throw if tables don't exist", async () => {
			asMock(schemaInfoService.hasTable).mockResolvedValueOnce(false)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		})

		it("should reorder dto if it's o2m", async () => {
			dto.type = "one-to-many"
			service["reverseOneToManyDto"] = vi.fn((dto) => ({
				...dto,
				type: "many-to-one",
				leftColumn: "reversed_side_123",
			}))
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.leftColumn).toEqual("reversed_side_123")
		})

		it("should throw if fk table is system table", async () => {
			dto.leftTable = "zmaj_test"
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if pk side does not have pk", async () => {
			asMock(schemaInfoService.getPrimaryKey).mockResolvedValue(undefined)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if fk column already exist", async () => {
			asMock(schemaInfoService.hasColumn).mockResolvedValue(true)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		})

		it("should throw if m2m", async () => {
			dto.type = "many-to-many"
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(
				InternalServerErrorException,
			)
		})
		it("should use pk info as right column, not provided value", async () => {
			dto.rightColumn = "test"
			const res = await service["validateDtoWithSchema"]({ ...dto, rightColumn: "id5" })
			expect(res.rightColumn).toEqual("id")
		})

		it("should expand relation", async () => {
			const res = await service["validateDtoWithSchema"](
				new RelationCreateDto({
					leftColumn: "post_id_1",
					leftFkName: "comments_post_id_foreign_1",
					leftLabel: "Posts_1",
					leftPropertyName: "posts_1",
					leftTable: "comments_1",
					leftTemplate: "l_tmp",
					onDelete: "CASCADE",
					rightColumn: "id_1",
					rightLabel: "Comments_1",
					rightPropertyName: "comments_1",
					rightTable: "posts_1",
					rightTemplate: "r_tmp",
					type: "many-to-one",
				}),
			)

			expect(res).toEqual({
				leftColumn: "post_id_1",
				leftFkName: "comments_post_id_foreign_1",
				leftLabel: "Posts_1",
				leftPropertyName: "posts_1",
				leftTable: "comments_1",
				leftTemplate: "l_tmp",
				onDelete: "CASCADE",
				rightColumn: "id",
				rightLabel: "Comments_1",
				rightPropertyName: "comments_1",
				rightTable: "posts_1",
				type: "many-to-one",
				rightTemplate: "r_tmp",
				rightPkType: "uuid",
			})
		})
	})

	describe("reverseOneToManyDto", () => {
		it("should throw if relation is not o2m", () => {
			expect(() => service["reverseOneToManyDto"]({ type: "many-to-one" } as any)).toThrow(
				InternalServerErrorException,
			)
		})

		it("should reverse o2m to m2o", () => {
			const res = service["reverseOneToManyDto"](
				RelationCreateDto.fromPartial({
					leftColumn: "id",
					leftTable: "posts",
					leftLabel: "Comments",
					leftPropertyName: "comments",
					leftTemplate: "{comment_prop}",

					rightColumn: "post_id",
					rightTable: "comments",
					rightLabel: "Posts",
					rightPropertyName: "posts",
					rightTemplate: "{post_title}",
					onDelete: "CASCADE",

					type: "one-to-many",
					leftFkName: "l_fk_name",
				}),
			)
			expect(res).toEqual({
				rightColumn: "id",
				rightTable: "posts",
				rightLabel: "Comments",
				rightPropertyName: "comments",
				rightTemplate: "{comment_prop}",

				leftColumn: "post_id",
				leftTable: "comments",
				leftLabel: "Posts",
				leftPropertyName: "posts",
				leftTemplate: "{post_title}",
				onDelete: "CASCADE",

				type: "many-to-one",
				leftFkName: "l_fk_name",
			})
		})
	})

	describe("createRelation", () => {
		let expandedDto: DirectRelationCreateDto
		let dto: RelationCreateDto
		const createOne = vi.fn().mockResolvedValue("saved")
		const createOneField = vi.fn().mockResolvedValue("saved_field")

		beforeEach(() => {
			expandedDto = {
				type: "many-to-one",
				leftTable: "posts",
				rightTable: "comments",
				leftColumn: "comment_id",
				rightColumn: "id",
				leftFkName: "left_fk_name",
				leftLabel: "ll",
				leftPropertyName: "lp",
				leftTemplate: "lt",
				onDelete: "CASCADE",
				rightLabel: "rl",
				rightPkType: "uuid",
				rightPropertyName: "rp",
				rightTemplate: "rt",
			}

			dto = new RelationCreateDto(expandedDto)

			service["validateDtoWithSchema"] = vi.fn(async () => expandedDto)
			service["repo"].createOne = createOne
			service["fieldsRepo"].createOne = createOneField
			alterSchemaService.createColumn = vi.fn()
			alterSchemaService.createFk = vi.fn()
		})

		it("should create unique column if relation is one-to-one", async () => {
			expandedDto.type = "owner-one-to-one"
			await service.createRelation(dto)
			expect(alterSchemaService.createColumn).toBeCalledWith(
				expect.objectContaining({ unique: true }),
				expect.anything(),
			)
		})

		//
		it("should create column and fk", async () => {
			await service.createRelation(dto)
			expect(alterSchemaService.createColumn).toBeCalledWith(
				{
					columnName: "comment_id",
					dataType: {
						type: "specific",
						value: "uuid",
					},
					tableName: "posts",
					unique: false,
				},
				{ trx: "TEST_TRX" },
			)
			expect(alterSchemaService.createFk).toBeCalledWith(
				{
					fkColumn: "comment_id",
					fkTable: "posts",
					onDelete: "CASCADE",
					referencedColumn: "id",
					referencedTable: "comments",
					indexName: "posts_comment_id_foreign",
				},
				{ trx: "TEST_TRX" },
			)
		})

		it("should create relation in db", async () => {
			await service.createRelation(dto)
			expect(createOne).nthCalledWith(1, {
				trx: "TEST_TRX",
				data: expect.objectContaining({
					fkName: "posts_comment_id_foreign",
					label: "ll",
					propertyName: "lp",
					tableName: "posts",
					template: "lt",
				}),
			})
			//
		})

		it("should create other side if not system table", async () => {
			await service.createRelation(dto)
			expect(createOne).nthCalledWith(2, {
				trx: "TEST_TRX",
				data: expect.objectContaining({
					fkName: "posts_comment_id_foreign",
					label: "rl",
					propertyName: "rp",
					tableName: "comments",
					template: "rt",
				}),
			})
		})

		it("should not create other side if system relation", async () => {
			service["validateDtoWithSchema"] = vi.fn(async () => ({
				...expandedDto,
				rightTable: "zmaj_test",
			}))
			await service.createRelation(dto)
			expect(createOne).toBeCalledTimes(1)
		})

		it("should return created relation", async () => {
			const res = await service.createRelation(dto)
			expect(res).toEqual("saved")
		})
	})

	describe("deleteRelation", () => {
		//
		let relation: RelationDef
		const deleteWhere = vi.fn()
		beforeEach(() => {
			relation = RelationDefStub({
				type: "many-to-one",
				relation: RelationMetadataStub({ fkName: "hello" }),
				tableName: "fk_table",
				columnName: "fk_column",

				// fkName: "hello",
				// fkTable: "fk_table",
				// fkColumn: "fk_column",
			})
			service["repo"].deleteWhere = deleteWhere
			alterSchemaService.dropFk = vi.fn()
		})
		//

		it("should throw if relation is mtm", async () => {
			makeWritable(relation).type = "many-to-many"
			// relation.type = "many-to-many"
			await expect(service.deleteRelation(relation)).rejects.toThrow(InternalServerErrorException)
		})

		it("should throw if fk is in system table", async () => {
			relation.tableName = "zmaj_test"
			await expect(service.deleteRelation(relation)).rejects.toThrow(ForbiddenException)
		})

		it("should remove all relation with relevant fk", async () => {
			await service.deleteRelation(relation)
			expect(deleteWhere).toBeCalledWith({ trx: "TEST_TRX", where: { fkName: "hello" } })
		})

		it("should remove fk from schema", async () => {
			await service.deleteRelation(relation)
			expect(alterSchemaService.dropFk).toBeCalledWith(
				{
					fkColumn: "fk_column",
					fkTable: "fk_table",
					indexName: "hello",
				},
				{ trx: "TEST_TRX" },
			)
		})
	})
})
