import { knexQuery } from "@api/database/knex-query"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { INestApplication, InternalServerErrorException } from "@nestjs/common"
import {
	CollectionCreateDto,
	CollectionDef,
	CollectionMetadata,
	CollectionMetadataModel,
	CollectionUpdateDto,
	DbMigrationModel,
	throwErr,
	User,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager, SchemaInfoService, SequelizeService } from "@zmaj-js/orm"
import { camel } from "radash"
import { DataTypes } from "sequelize"
import supertest from "supertest"
import { v4 } from "uuid"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"

const tableName = "test_table_collection_metadata"

describe("CollectionsController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let schemaInfoService: SchemaInfoService
	let infraStateService: InfraStateService
	let repoManager: RepoManager
	//
	let migrationsRepo: OrmRepository<DbMigrationModel>
	let collectionsRepo: OrmRepository<CollectionMetadataModel>
	//
	let user: User
	let collection: CollectionDef
	//

	//
	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		//
		schemaInfoService = app.get(SchemaInfoService)
		repoManager = app.get(RepoManager)

		infraStateService = app.get(InfraStateService)

		migrationsRepo = all.repo(DbMigrationModel)
		collectionsRepo = all.repo(CollectionMetadataModel)

		user = await all.createUser()
	})

	afterAll(async () => {
		await all.deleteUser(user)
		await all.dropTableAndSync(tableName)
		await app.close()
	})

	beforeEach(async () => {
		await all.changeInfra(async () => {
			await all.dropTable(tableName)

			await app.get(SequelizeService).qi.createTable(tableName, {
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					autoIncrementIdentity: true,
				},
				name: { type: DataTypes.STRING },
				value: { type: DataTypes.TEXT },
			})
		})

		collection = infraStateService.getCollection(camel(tableName)) ?? throwErr("78439214")
	})

	afterEach(async () => {
		await all.dropTableAndSync(tableName)
	})

	it("should be defined", async () => {
		expect(app).toBeDefined()
	})

	/**
	 *
	 */
	describe("POST /system/infra/collections", () => {
		// we have to delete this table first
		beforeEach(async () => {
			await all.dropTableAndSync(tableName)
		})

		it("should create collection", async () => {
			const res = await supertest(app.getHttpServer())
				.post("/api/system/infra/collections")
				.auth(user.email, "password")
				.send(
					new CollectionCreateDto({
						tableName: tableName,
						collectionName: tableName,
						pkColumn: "id2",
						pkType: "uuid",
					}),
				)

			expect(res.statusCode).toEqual(201)

			// collection created and is in state
			const colInState = infraStateService.getCollection(tableName)
			expect(colInState).toBeDefined()

			// field is created and is in state
			const field = colInState?.fields["id2"]
			expect(field).toBeDefined()

			// created collection is returned
			expect(res.body.data).toMatchObject({
				tableName: tableName,
				id: colInState!.id,
			} satisfies Partial<CollectionMetadata>)

			// collection is in db
			const colInDb = await collectionsRepo.findOne({
				where: { tableName: tableName },
			})
			expect(colInDb).toBeDefined()

			// pk exist, means that table exists
			const pk = await schemaInfoService.getPrimaryKey(tableName)
			expect(pk).toBeDefined()
			// pk should have name and type provided
			expect(pk?.columnName).toEqual("id2")
			expect(pk?.dataType).toEqual("uuid")

			// test that repo works
			const rawQuery = knexQuery
				.from(tableName)
				.insert([{ id2: v4() }, { id2: v4() }])
				.toQuery()
			await repoManager.rawQuery(rawQuery)
			const testRepo = repoManager.getRepo(tableName)
			expect(testRepo).toBeDefined()
			const inTable = await testRepo.findWhere({})
			expect(inTable).toHaveLength(2)

			// TODO not creating migrations currently
			// migration should have been created
			// const migrations = await migrationsRepo.findWhere({
			// 	where: { name: { $like: `%__create_table_${tableName}` } },
			// })
			// expect(migrations).toHaveLength(1)
		})
	})

	/**
	 *
	 */
	describe("PUT /system/infra/collections/:id", () => {
		it("should update collection", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/collections/${collection.id}`)
				.auth(user.email, "password")
				.send(
					new CollectionUpdateDto({
						displayTemplate: "super {id}",
					}),
				)

			expect(res.statusCode).toEqual(200)

			// collection in db should have changed values
			const colInDb = await collectionsRepo.findById({
				id: collection.id,
			})
			expect(colInDb.displayTemplate).toEqual("super {id}")

			// collection in state should have changed values
			const colInState = infraStateService.getCollection(collection)
			expect(colInState?.displayTemplate).toEqual("super {id}")
		})

		it("should update orm if needed", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/collections/${collection.id}`)
				.auth(user.email, "password")
				.send(new CollectionUpdateDto({ disabled: true }))

			expect(res.statusCode).toEqual(200)

			// disabled state should be changed
			expect(infraStateService.getCollection(collection.collectionName)?.disabled).toEqual(true)

			// don't initialize repo if collection disabled
			expect(() => {
				return repoManager.getRepo(collection.tableName)
			}).toThrow(InternalServerErrorException)
		})
	})

	/**
	 *
	 */
	describe("DELETE /system/infra/collections/:id", () => {
		it("should delete collection", async () => {
			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/infra/collections/${collection.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)

			// there should be no collection in db
			const colInDb = await collectionsRepo.findOne({
				where: { tableName: tableName },
			})
			expect(colInDb).toBeUndefined()

			// there should be no table
			const exist = await schemaInfoService.hasTable(tableName)
			expect(exist).toEqual(false)

			// there should be no collection in state
			const colInState = infraStateService.getCollection(tableName)
			expect(colInState).toBeUndefined()

			// there should be no repo
			expect(() => repoManager.getRepo(tableName)).toThrow(InternalServerErrorException)

			// TODO not creating migrations currently
			// there should be migration that does this, and reverts
			// const migrations = await migrationsRepo.findWhere({
			// 	where: { name: { $like: `%__drop_table_${tableName}` } },
			// })
			// expect(migrations).toHaveLength(1)
		})
	})
})
