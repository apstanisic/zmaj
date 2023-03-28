import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { SchemaInfoService } from "@api/database/schema/schema-info.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
} from "@nestjs/common"
import {
	CollectionDef,
	DirectRelationCreateDto3,
	RelationCreateDto,
	RelationDef,
	makeWritable,
} from "@zmaj-js/common"
import { CollectionDefStub, RelationDefStub, RelationMetadataStub } from "@zmaj-js/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { DirectRelationService } from "./direct-relations.service"

describe("DirectRelationsService", () => {
	let service: DirectRelationService
	let schemaInfoService: SchemaInfoService
	let alterSchemaService: AlterSchemaService
	let infraState: InfraStateService
	//
	beforeEach(async () => {
		const module = await buildTestModule(DirectRelationService).compile()
		service = module.get(DirectRelationService)
		schemaInfoService = module.get(SchemaInfoService)
		alterSchemaService = module.get(AlterSchemaService)
		infraState = module.get(InfraStateService)
	})

	describe("validateDtoWithSchema", () => {
		let dto: RelationCreateDto
		let leftCol: CollectionDef
		let rightCol: CollectionDef

		beforeEach(() => {
			leftCol = CollectionDefStub({ collectionName: "hello" })
			rightCol = CollectionDefStub({ collectionName: "world" })

			dto = new RelationCreateDto({
				leftCollection: leftCol.collectionName,
				rightCollection: rightCol.collectionName,
				left: { column: "lc", propertyName: "lpn" },
				right: { column: "rc", propertyName: "rpn" },
				type: "many-to-one",
				fkName: "hello",
			})

			infraState.getCollection = vi.fn((col: string) =>
				col === leftCol.collectionName
					? leftCol
					: col === rightCol.collectionName
					? rightCol
					: undefined,
			)

			schemaInfoService.hasColumn = vi.fn().mockResolvedValue(false)
		})

		it("should throw if collection don't exist", async () => {
			vi.mocked(infraState.getCollection).mockReturnValue(undefined)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		})

		it("should reorder dto if it's o2m", async () => {
			dto.type = "one-to-many"
			dto.right.column = "reversed_side_123"
			const res = await service["validateDtoWithSchema"](dto)
			expect(res.left.column).toEqual("reversed_side_123")
		})

		it("should throw if fk table is system table", async () => {
			vi.mocked(infraState.getCollection).mockReturnValue(
				CollectionDefStub({ tableName: "zmaj_users" }),
			)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(ForbiddenException)
		})

		it("should throw if fk column already exist", async () => {
			vi.mocked(schemaInfoService.hasColumn).mockResolvedValue(true)
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(BadRequestException)
		})

		it("should throw if m2m", async () => {
			dto.type = "many-to-many"
			await expect(service["validateDtoWithSchema"](dto)).rejects.toThrow(
				InternalServerErrorException,
			)
		})
		it("should use pk info as right column, not provided value", async () => {
			dto.right.column = "test"
			const res = await service["validateDtoWithSchema"]({
				...dto,
				right: { ...dto.right, column: "id5" },
			})
			expect(res.right.column).toEqual(rightCol.pkColumn)
		})

		it("should expand relation", async () => {
			service["reverseIfOtm"] = vi.fn((v) => v as any)
			const partialDto = new RelationCreateDto({
				leftCollection: leftCol.collectionName,
				rightCollection: rightCol.collectionName,
				fkName: "comments_post_id_foreign_1",
				onDelete: "CASCADE",
				left: {
					column: "post_id_1",
					label: "Posts_1",
					propertyName: "posts_1",
					template: "l_tmp",
				},
				right: {
					column: "id_1",
					label: "Comments_1",
					propertyName: "comments_1",
					template: "r_tmp",
				},
				type: "many-to-one",
			})

			const res = await service["validateDtoWithSchema"](partialDto)

			expect(res).toEqual({
				leftCollection: leftCol.collectionName,
				rightCollection: rightCol.collectionName,
				fkName: "comments_post_id_foreign_1",
				onDelete: "CASCADE",
				left: {
					column: "post_id_1",
					label: "Posts_1",
					propertyName: "posts_1",
					table: leftCol.tableName,
					template: "l_tmp",
				},
				right: {
					column: rightCol.pkColumn,
					label: "Comments_1",
					propertyName: "comments_1",
					template: "r_tmp",
					table: rightCol.tableName,
				},
				pkType: rightCol.fields[rightCol.pkField]!.dbRawDataType,
				type: "many-to-one",
			} satisfies DirectRelationCreateDto3)
		})
	})

	describe("reverseIfOtm", () => {
		it("should do nothing if m2o", () => {
			const res = service["reverseIfOtm"]({ type: "many-to-one" } as any)
			expect(res).toEqual({ type: "many-to-one" })
		})

		it("should reverse o2m to m2o", () => {
			const res = service["reverseIfOtm"](
				RelationCreateDto.fromPartial({
					leftCollection: "posts",
					left: {
						column: "id",
						label: "Comments",
						propertyName: "comments",
						template: "{comment_prop}",
					},

					rightCollection: "comments",
					right: {
						column: "post_id",
						label: "Posts",
						propertyName: "posts",
						template: "{post_title}",
					},
					onDelete: "CASCADE",
					type: "one-to-many",
					fkName: "l_fk_name",
				}),
			)
			expect(res).toEqual({
				rightCollection: "posts",
				right: {
					column: "id",
					label: "Comments",
					propertyName: "comments",
					template: "{comment_prop}",
				},

				leftCollection: "comments",
				left: {
					column: "post_id",
					label: "Posts",
					propertyName: "posts",
					template: "{post_title}",
				},
				onDelete: "CASCADE",

				type: "many-to-one",
				fkName: "l_fk_name",
			})
		})
	})

	describe("createRelation", () => {
		let expandedDto: DirectRelationCreateDto3
		let dto: RelationCreateDto
		const createOne = vi.fn().mockResolvedValue("saved")
		const createOneField = vi.fn().mockResolvedValue("saved_field")

		beforeEach(() => {
			expandedDto = {
				type: "many-to-one",
				leftCollection: "posts",
				rightCollection: "comments",
				fkName: "my_fk_name",
				left: {
					column: "comment_id",
					label: "ll",
					propertyName: "lp",
					template: "lt",
					table: "posts",
				},
				right: {
					column: "id",
					label: "rl",
					propertyName: "rp",
					template: "rt",
					table: "comments",
				},
				pkType: "uuid",
				onDelete: "CASCADE",
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
			)
		})

		//
		it("should create column and fk", async () => {
			await service.createRelation(dto)
			expect(alterSchemaService.createColumn).toBeCalledWith({
				columnName: "comment_id",
				dataType: {
					type: "specific",
					value: "uuid",
				},
				tableName: "posts",
				unique: false,
				trx: "TEST_TRX",
			})
			expect(alterSchemaService.createFk).toBeCalledWith({
				fkColumn: "comment_id",
				fkTable: "posts",
				onDelete: "CASCADE",
				referencedColumn: "id",
				referencedTable: "comments",
				indexName: "my_fk_name",
				trx: "TEST_TRX",
			})
		})

		it("should create relation in db", async () => {
			await service.createRelation(dto)
			expect(createOne).nthCalledWith(1, {
				trx: "TEST_TRX",
				data: expect.objectContaining({
					fkName: "my_fk_name",
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
					fkName: "my_fk_name",
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
				right: { ...expandedDto.right, table: "zmaj_test" },
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
			expect(alterSchemaService.dropFk).toBeCalledWith({
				fkColumn: "fk_column",
				fkTable: "fk_table",
				indexName: "hello",
				trx: "TEST_TRX",
			})
		})
	})
})
