import { OrmRepository } from "@zmaj-js/orm"
import { SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import { DataTypes } from "sequelize"
import {
	DbColumn,
	DbMigration,
	DbMigrationCollection,
	ForeignKey,
	RelationCreateDto,
	RelationDef,
	RelationMetadata,
	RelationMetadataCollection,
	RelationUpdateDto,
	throwErr,
	User,
	UUID,
} from "@zmaj-js/common"
import { camel } from "radash"
import supertest from "supertest"
import { PartialDeep } from "type-fest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { CollectionsService } from "../collections-info/collections.service"
import { InfraStateService } from "../infra-state/infra-state.service"
import { RelationsService } from "./relations.service"

const ownerTableName = "test_table_books"
const refTableName = "test_table_authors"

const ownerCollectionName = camel(ownerTableName)
const refCollectionName = camel(refTableName)

describe("RelationController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let schemaInfoService: SchemaInfoService
	let infraStateService: InfraStateService
	let relationsService: RelationsService
	//
	let migrationsRepo: OrmRepository<DbMigration>
	let relationsRepo: OrmRepository<RelationMetadata>
	//
	let user: User
	//

	//
	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		//
		schemaInfoService = app.get(SchemaInfoService)

		infraStateService = app.get(InfraStateService)
		relationsService = app.get(RelationsService)

		migrationsRepo = all.repo(DbMigrationCollection)
		relationsRepo = all.repo(RelationMetadataCollection)
	})

	afterAll(async () => {
		await all.changeInfra(async () => {
			// await all.dropTable(junctionTableName)
			await all.dropTable(ownerTableName)
			await all.dropTable(refTableName)
		})
		await app.close()
	})

	beforeEach(async () => {
		user = await all.createUser()

		await all.changeInfra(async () => {
			// await all.dropTable(junctionTableName)
			await all.dropTable(ownerTableName)
			await all.dropTable(refTableName)

			const qi = app.get(SequelizeService).qi
			await qi.createTable(refTableName, {
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					autoIncrementIdentity: true,
				},
				name: DataTypes.STRING,
				email: DataTypes.STRING,
			})
			await qi.createTable(ownerTableName, {
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					autoIncrementIdentity: true,
				},
				title: DataTypes.STRING,
				test_author_id: {
					type: DataTypes.INTEGER,
					references: { model: refTableName, key: "id" },
				},
			})
		})
	})

	afterEach(async () => {
		await all.deleteUser(user)

		await all.changeInfra(async () => {
			// await all.dropTable(junctionTableName)
			await all.dropTable(ownerTableName)
			await all.dropTable(refTableName)
		})

		await migrationsRepo.deleteWhere({ where: { name: { $like: "%create_relation%" } } })
	})

	it("should be defined", async () => {
		expect(app).toBeDefined()
	})

	describe("POST /system/infra/relations", () => {
		/**
		 *
		 */
		describe("many-to-one", () => {
			let dto: RelationCreateDto

			beforeEach(() => {
				dto = new RelationCreateDto({
					type: "many-to-one",
					left: {
						column: "author_id",
						propertyName: "author",
					},
					right: {
						column: "id",
						propertyName: "books",
					},
					leftCollection: ownerCollectionName,
					rightCollection: refCollectionName,
				})
			})

			it("should create m2o relation", async () => {
				const res = await supertest(app.getHttpServer())
					.post("/api/system/infra/relations")
					.auth(user.email, "password")
					.send(dto)

				expect(res.statusCode).toEqual(201)

				const createdCol = await schemaInfoService.hasColumn(ownerTableName, dto.left.column)
				expect(createdCol).toEqual(true)

				// const fks = await schemaInfoService.getForeignKeys()

				const createdFk = await schemaInfoService.getForeignKey({
					table: ownerTableName,
					column: dto.left.column,
				})
				expect(createdFk).toMatchObject<Partial<ForeignKey>>({
					fkColumn: dto.left.column,
					fkTable: ownerTableName,
					referencedColumn: dto.right.column,
					referencedTable: refTableName,
				})

				const leftRelation =
					infraStateService.getCollection(ownerCollectionName)?.relations[dto.left.propertyName]
				expect(leftRelation).toBeDefined()
				expect((leftRelation as RelationDef).type).toEqual("many-to-one")

				expect(res.body.data).toEqual(fixTestDate(leftRelation))

				const rightRelation =
					infraStateService.getCollection(refCollectionName)?.relations[dto.right.propertyName]
				expect(rightRelation).toBeDefined()
				expect((rightRelation as RelationDef).type).toEqual("one-to-many")

				// TODO not creating migrations currently
				// const migrationsCreated = await migrationsRepo.findWhere({
				// 	where: { name: { $like: "%create_relation%" } },
				// })
				// expect(migrationsCreated).toHaveLength(1)
			})
		})

		/**
		 *
		 */
		describe("one-to-many", () => {
			let dto: RelationCreateDto
			beforeEach(() => {
				dto = new RelationCreateDto({
					type: "one-to-many",
					leftCollection: refCollectionName,
					left: { column: "id", propertyName: "books" },
					rightCollection: ownerCollectionName,
					right: {
						column: "author_id",
						propertyName: "author",
					},
				})
			})

			it("should create o2m relation", async () => {
				const res = await supertest(app.getHttpServer())
					.post("/api/system/infra/relations")
					.auth(user.email, "password")
					.send(dto)

				expect(res.statusCode).toEqual(201)

				const createdCol = await schemaInfoService.hasColumn(ownerTableName, dto.right.column)
				expect(createdCol).toEqual(true)

				const createdFk = await schemaInfoService.getForeignKey({
					table: ownerTableName,
					column: dto.right.column,
				})
				expect(createdFk).toMatchObject({
					fkColumn: dto.right.column,
					fkTable: ownerTableName,
					referencedColumn: dto.left.column,
					referencedTable: refTableName,
				} as ForeignKey)

				const leftRelation =
					infraStateService.getCollection(refCollectionName)?.relations[dto.left.propertyName]
				expect(leftRelation).toBeDefined()
				expect((leftRelation as RelationDef).type).toEqual("one-to-many")

				expect(res.body.data).toEqual(fixTestDate(leftRelation))

				const rightRelation =
					infraStateService.getCollection(ownerCollectionName)?.relations[dto.right.propertyName]
				expect(rightRelation).toBeDefined()
				expect((rightRelation as RelationDef).type).toEqual("many-to-one")

				// const migrationsCreated = await migrationsRepo.findWhere({
				// 	where: { name: { $like: "%create_relation%" } },
				// })
				// expect(migrationsCreated).toHaveLength(1)
			})
		})

		/**
		 *
		 */
		describe("owner-one-to-one", () => {
			let dto: RelationCreateDto
			beforeEach(() => {
				dto = new RelationCreateDto({
					type: "owner-one-to-one",
					leftCollection: ownerCollectionName,
					left: { column: "author_id", propertyName: "authors" },
					right: { column: "id", propertyName: "books" },
					rightCollection: refCollectionName,
				})
			})

			it("should create owner o2o relation", async () => {
				const res = await supertest(app.getHttpServer())
					.post("/api/system/infra/relations")
					.auth(user.email, "password")
					.send(dto)

				expect(res.statusCode).toEqual(201)

				const createdCol = await schemaInfoService.getColumn({
					table: ownerTableName,
					column: dto.left.column,
				})
				expect(createdCol).toBeDefined()
				expect(createdCol?.unique).toEqual(true)

				const createdFk = await schemaInfoService.getForeignKey({
					table: ownerTableName,
					column: dto.left.column,
				})
				expect(createdFk).toMatchObject<Partial<ForeignKey>>({
					fkColumn: dto.left.column,
					fkTable: ownerTableName,
					referencedColumn: dto.right.column,
					referencedTable: refTableName,
				})

				const leftRelation =
					infraStateService.getCollection(ownerCollectionName)?.relations[dto.left.propertyName]
				expect(leftRelation).toBeDefined()
				expect((leftRelation as RelationDef).type).toEqual("owner-one-to-one")

				expect(res.body.data).toEqual(fixTestDate(leftRelation))

				const rightRelation =
					infraStateService.getCollection(refCollectionName)?.relations[dto.right.propertyName]
				expect(rightRelation).toBeDefined()
				expect((rightRelation as RelationDef).type).toEqual("ref-one-to-one")

				// const migrationsCreated = await migrationsRepo.findWhere({
				// 	where: { name: { $like: "%create_relation%" } },
				// })
				// expect(migrationsCreated).toHaveLength(1)
			})
		})

		/**
		 *
		 */
		describe("ref-one-to-one", () => {
			let dto: RelationCreateDto
			beforeEach(() => {
				dto = new RelationCreateDto({
					type: "ref-one-to-one",
					//
					leftCollection: refCollectionName,
					left: {
						column: "id",
						propertyName: "books",
					},
					right: {
						column: "author_id",
						propertyName: "authors",
					},
					rightCollection: ownerCollectionName,
				})
			})

			it("should create ref o2o relation", async () => {
				const res = await supertest(app.getHttpServer())
					.post("/api/system/infra/relations")
					.auth(user.email, "password")
					.send(dto)

				expect(res.statusCode).toEqual(201)

				const createdCol = await schemaInfoService.getColumn({
					table: ownerTableName,
					column: dto.right.column,
				})
				expect(createdCol).toBeDefined()
				expect(createdCol?.unique).toEqual(true)

				const createdFk = await schemaInfoService.getForeignKey({
					table: ownerTableName,
					column: dto.right.column,
				})
				expect(createdFk).toMatchObject({
					fkColumn: dto.right.column,
					fkTable: ownerTableName,
					referencedColumn: dto.left.column,
					referencedTable: refTableName,
				} as ForeignKey)

				const leftRelation =
					infraStateService.getCollection(refCollectionName)?.relations[dto.left.propertyName]
				expect(leftRelation).toBeDefined()
				expect((leftRelation as RelationDef).type).toEqual("ref-one-to-one")

				expect(res.body.data).toEqual(fixTestDate(leftRelation))

				const rightRelation =
					infraStateService.getCollection(ownerCollectionName)?.relations[dto.right.propertyName]
				expect(rightRelation).toBeDefined()
				expect((rightRelation as RelationDef).type).toEqual("owner-one-to-one")
			})
		})

		/**
		 *
		 */
		describe("many-to-many", () => {
			const junctionTableName = "test_table_authors_books_table"
			const junctionCollectionName = camel(junctionTableName)

			let dto: RelationCreateDto

			beforeEach(() => {
				dto = new RelationCreateDto({
					type: "many-to-many",
					leftCollection: ownerCollectionName,
					rightCollection: refCollectionName,
					left: { column: "id", propertyName: "authors" },
					right: { column: "id", propertyName: "books" },
					junction: {
						tableName: junctionTableName,
						left: { column: "book_id" },
						right: { column: "author_id" },
					},
				})
			})

			afterEach(async () => {
				await all.dropTable(junctionTableName)
			})

			it("should create m2m relation", async () => {
				const res = await supertest(app.getHttpServer())
					.post("/api/system/infra/relations")
					.auth(user.email, "password")
					.send(dto)

				expect(res.statusCode).toEqual(201)

				const hasTable = await schemaInfoService.hasTable(junctionTableName)
				expect(hasTable).toEqual(true)

				const pkCol = await schemaInfoService.getColumn({ table: junctionTableName, column: "id" })
				expect(pkCol).toMatchObject({ primaryKey: true } as DbColumn)

				// const leftCol = await schemaInfoService.getColumn(
				// 	dto.junctionTable!,
				// 	dto.junctionLeftColumn!,
				// )
				const fks = await schemaInfoService.getForeignKeys({
					table: junctionTableName,
				})

				expect(fks.length).toEqual(2)
				const leftFk = fks.find((fk) => fk.referencedTable === ownerTableName)!
				const rightFk = fks.find((fk) => fk.referencedTable === refTableName)!
				expect(leftFk).toMatchObject<Partial<ForeignKey>>({
					fkColumn: dto.junction?.left?.column ?? "_",
					fkTable: junctionTableName,
					referencedColumn: dto.left.column,
					referencedTable: ownerTableName,
					// onDelete: "CASCADE",
					// onUpdate: "CASCADE",
				})
				expect(rightFk).toMatchObject<Partial<ForeignKey>>({
					fkColumn: dto.junction?.right?.column ?? "_",
					fkTable: junctionTableName,
					referencedColumn: dto.right.column,
					referencedTable: refTableName,
					// onDelete: "CASCADE",
					// onUpdate: "CASCADE",
				})

				// toMatchObject({
				// 	foreignKey: {
				// 		pkColumn: dto.leftColumn,
				// 		pkTable: dto.leftTable,
				// 	},
				// })

				// const rightCol = await schemaInfoService.getColumn(
				// 	dto.junctionTable!,
				// 	dto.junctionRightColumn!,
				// )
				// expect(rightCol).toMatchObject({
				// 	foreignKey: {
				// 		pkColumn: dto.rightColumn,
				// 		pkTable: dto.rightTable,
				// 	},
				// } as DbColumn)

				const leftRelation =
					infraStateService.getCollection(ownerCollectionName)?.relations[dto.left.propertyName]
				expect(leftRelation).toBeDefined()
				expect(leftRelation?.type).toEqual("many-to-many")

				expect(res.body.data).toEqual(fixTestDate(leftRelation))

				const rightRelation =
					infraStateService.getCollection(refCollectionName)?.relations[dto.right.propertyName]
				expect(rightRelation).toBeDefined()
				expect((leftRelation as RelationDef).type).toEqual("many-to-many")

				// const migrationsCreated = await migrationsRepo.findWhere({
				// 	// it is create_mtm_relation
				// 	where: { name: { $like: "%create_relation%" } },
				// })
				// expect(migrationsCreated).toHaveLength(1)
			})
		})
	})

	describe("PUT /system/infra/relations/:id", () => {
		let relation: RelationDef

		beforeEach(() => {
			relation =
				infraStateService.relations.find(
					(r) => r.tableName === ownerTableName && r.columnName === "test_author_id",
				) ?? throwErr("8909089")
		})

		it("should update relation", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/relations/${relation.id}`)
				.auth(user.email, "password")
				.send(
					new RelationUpdateDto({
						template: "{id} is same as {id}",
						propertyName: "newPropertyName",
					}),
				)

			const validNewValues = {
				id: relation.id,
				relation: {
					id: relation.id,
					template: "{id} is same as {id}",
					propertyName: "newPropertyName",
				},
			} satisfies PartialDeep<RelationDef>

			// should return updated
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(validNewValues)

			// should update relation in state
			const relationInState = infraStateService.relations.find((r) => r.id === relation.id)
			expect(relationInState).toMatchObject(validNewValues)

			const relationInDb = await relationsRepo.findById({ id: relation.id })
			expect(relationInDb).toMatchObject(validNewValues.relation)
		})
		//
	})

	describe("DELETE /system/infra/relations/:id", () => {
		let relation: RelationDef
		let rightRelation: RelationDef

		beforeEach(() => {
			relation =
				infraStateService.relations.find(
					(r) => r.tableName === ownerTableName && r.columnName === "test_author_id",
				) ?? throwErr("748126")

			rightRelation =
				infraStateService.relations.find((r) => r.id === relation.otherSide.relationId) ??
				throwErr("3748236")
		})

		afterEach(async () => {
			await migrationsRepo.deleteWhere({ where: { name: { $like: "%drop_fk_books_r_e2e%" } } })
		})

		it("should delete m2o relation", async () => {
			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/infra/relations/${relation.id}`)
				.auth(user.email, "password")

			// should return updated
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject({ id: relation.id })

			// should remove relation in state
			const relationInState = infraStateService.relations.find((r) => r.id === relation.id)
			expect(relationInState).toBeUndefined()
			// should remove right relation in state
			const rightRelationInState = infraStateService.relations.find(
				(r) => r.id === rightRelation.id,
			)
			expect(rightRelationInState).toBeUndefined()

			const relationsInDb = await relationsRepo.findWhere({
				where: { id: { $in: [relation.id, rightRelation.id] } },
			})
			expect(relationsInDb).toHaveLength(0)
		})
		//
	})

	describe("PUT /system/infra/relations/split-mtm/:junctionCollection", () => {
		const junctionTable = "junction_yyy"
		const junctionCollectionName = camel(junctionTable)

		beforeEach(async () => {
			await relationsService.createRelation(
				new RelationCreateDto({
					type: "many-to-many",
					left: {
						column: "id",
						propertyName: "leftProp",
					},
					right: {
						column: "id",
						propertyName: "rightProp",
					},
					junction: { tableName: junctionTable },
					leftCollection: ownerCollectionName,
					rightCollection: refCollectionName,
				}),
			)
		})

		afterEach(async () => {
			const col = infraStateService.collections[junctionCollectionName]
			if (!col) throwErr()
			await app.get(CollectionsService).removeCollection(col.id as UUID)
		})

		it("split many-to-many", async () => {
			const relBefore = infraStateService.relations.filter(
				(r) => r.type === "many-to-many" && r.junction.collectionName === junctionCollectionName,
			)
			expect(relBefore).toHaveLength(2)

			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/relations/split-mtm/${junctionCollectionName}`)
				.auth(user.email, "password")

			// should return updated
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(2)

			// should remove relation in state
			const m2mRelationsWithThisJunctionTable = infraStateService.relations.filter(
				(r) => r.type === "many-to-many" && r.junction.collectionName === junctionCollectionName,
			)
			expect(m2mRelationsWithThisJunctionTable).toHaveLength(0)

			const relationsInDb = await relationsRepo.findWhere({
				where: { id: { $in: [relBefore[0]!.id, relBefore[1]!.id] } },
			})
			expect(relationsInDb.every((r) => r.mtmFkName === null)).toEqual(true)
		})
		//
	})

	describe("PUT /system/infra/relations/join-mtm/:junctionCollection", () => {
		const junctionTable = "junction_ttt"
		const junctionCollection = camel(junctionTable)

		beforeEach(async () => {
			await relationsService.createRelation(
				new RelationCreateDto({
					type: "many-to-many",
					left: {
						column: "id",
						propertyName: "leftProp",
					},
					right: {
						column: "id",
						propertyName: "rightProp",
					},
					leftCollection: ownerCollectionName,
					rightCollection: refCollectionName,
					junction: { tableName: junctionTable },
				}),
			)
			await relationsService.splitManyToMany(junctionCollection)
		})

		afterEach(async () => {
			const col = infraStateService.collections[junctionCollection]
			if (!col) throwErr()
			await app.get(CollectionsService).removeCollection(col.id as UUID)
		})

		it("join many-to-many", async () => {
			const relBefore = infraStateService.relations.filter(
				(r) => r.type === "many-to-many" && r.junction.collectionName === junctionCollection,
			)

			expect(relBefore).toHaveLength(0)

			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/relations/join-mtm/${junctionCollection}`)
				.auth(user.email, "password")

			// should return updated
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(2)

			// should remove relation in state
			const m2mRelationsWithThisJunctionTable = infraStateService.relations.filter(
				(r) => r.type === "many-to-many" && r.junction.collectionName === junctionCollection,
			)
			expect(m2mRelationsWithThisJunctionTable).toHaveLength(2)

			const m2mIds = m2mRelationsWithThisJunctionTable.map((r) => r.id)

			const relationsInDb = await relationsRepo.findWhere({
				where: { id: { $in: m2mIds } },
			})
			expect(relationsInDb.every((r) => r.mtmFkName !== null)).toEqual(true)
		})
		//
	})
})
