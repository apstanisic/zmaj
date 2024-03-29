import { knexQuery } from "@api/database/knex-query"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { INestApplication } from "@nestjs/common"
import {
	CollectionDef,
	DbMigrationModel,
	FieldCreateDto,
	FieldDef,
	FieldMetadataModel,
	FieldUpdateDto,
	throwErr,
	User,
} from "@zmaj-js/common"
import { Orm, OrmRepository, SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { camel } from "radash"
import { DataTypes } from "sequelize"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"

describe("RelationController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let schemaInfoService: SchemaInfoService
	let infraStateService: InfraStateService
	let orm: Orm
	let sqService: SequelizeService
	//
	let migrationsRepo: OrmRepository<DbMigrationModel>
	let fieldsRepo: OrmRepository<FieldMetadataModel>
	//
	let user: User
	let collection: CollectionDef
	//
	const tableName = "test_table_field_metadata"
	const collectionName = camel(tableName)

	//
	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		// app.useLogger(console)
		//
		schemaInfoService = app.get(SchemaInfoService)
		sqService = app.get(SequelizeService)
		orm = app.get(Orm)

		infraStateService = app.get(InfraStateService)

		migrationsRepo = all.getRepo(DbMigrationModel)
		fieldsRepo = all.getRepo(FieldMetadataModel)
	})

	afterAll(async () => {
		await all.dropTableAndSync(tableName)
		await app.close()
	})

	beforeEach(async () => {
		await all.changeInfra(async () => {
			await all.dropTable(tableName)
			await sqService.qi.createTable(tableName, {
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

		collection = infraStateService.getCollection(collectionName) ?? throwErr("7843612")

		user = await all.createUser()
	})

	afterEach(async () => {
		await all.deleteUser(user)
		all.dropTableAndSync(tableName)
	})

	it("should be defined", async () => {
		expect(app).toBeDefined()
	})

	describe("POST /system/infra/fields", () => {
		const newField = "new_field"

		it("should create field", async () => {
			const hasField = await schemaInfoService.hasColumn({
				table: tableName,
				column: newField,
			})
			expect(hasField).toEqual(false)

			const res = await supertest(app.getHttpServer())
				.post("/api/system/infra/fields")
				.auth(user.email, "password")
				.send(
					new FieldCreateDto({
						columnName: newField,
						dataType: "text",
						isNullable: true,
						collectionName: collectionName,
					}),
				)

			expect(res.statusCode).toEqual(201)

			// field should exist in state
			const fieldInState = infraStateService.fields.find(
				(f) => f.columnName === newField && f.tableName === tableName,
			)
			expect(fieldInState).toBeDefined()

			// field should exist in db
			const fieldInDb = await fieldsRepo.findOne({
				where: { tableName: tableName, columnName: newField },
			})
			expect(fieldInDb).toBeDefined()

			// column should have been created
			const column = await schemaInfoService.getColumn({ table: tableName, column: newField })
			expect(column).toBeDefined()
			expect(column?.dataType).toEqual("text")
			expect(column?.nullable).toEqual(true)

			//
			// created field should be added to repo
			const testRepo = orm.getRepo(collectionName)
			await testRepo.createOne({ data: { [fieldInState!.fieldName]: "test_me" } })
			const inTable = await testRepo.findWhere({})
			expect(inTable).toEqual([
				{ id: 1, name: null, value: null, [camel(newField)]: "test_me" },
			])

			// TODO not creating migrations currently
			// // migration should have been created
			// const migrations = await migrationsRepo.findWhere({
			// 	where: { name: { $like: `%__create_column_${tableName}_new_field` } },
			// })
			// expect(migrations).toHaveLength(1)
		})
	})

	/**
	 *
	 */
	describe("PUT /system/infra/fields/:id", () => {
		let field: FieldDef
		beforeEach(() => {
			field = collection.fields["value"] ?? throwErr("789112")
		})

		it("should update field", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/fields/${field.id}`)
				.auth(user.email, "password")
				.send(
					new FieldUpdateDto({
						label: "NewLabel",
					}),
				)

			expect(res.statusCode).toEqual(200)

			// field in state should be updated
			const fieldInState = infraStateService.fields.find((f) => f.id === field.id)
			expect(fieldInState?.label).toEqual("NewLabel")

			// field in db should be updated
			const fieldInDb = await fieldsRepo.findById({
				id: field.id,
			})
			expect(fieldInDb.label).toEqual("NewLabel")
		})

		it("should update orm if needed", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/system/infra/fields/${field.id}`)
				.auth(user.email, "password")
				.send(new FieldUpdateDto({ canRead: false }))

			expect(res.statusCode).toEqual(200)

			// if field is hidden we need to update orm to not fetch that field
			const rawQuery = knexQuery
				.from(tableName)
				.insert({ name: "test", value: "new value" })
				.toQuery()
			await all.orm.rawQuery(rawQuery)
			const inDb = await orm.getRepo(collectionName).findWhere({})
			expect(inDb).toEqual([{ id: 1, name: "test" }])
			expect(inDb[0]?.["value"]).toBeUndefined()
		})
	})

	/**
	 *
	 */
	describe("DELETE /system/infra/fields/:id", () => {
		let field: FieldDef
		beforeEach(() => {
			field = collection.fields["value"] ?? throwErr("78943126")
		})

		it("should delete field", async () => {
			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/infra/fields/${field.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)

			// should delete field from state
			const fieldInState = infraStateService.fields.find(
				(f) => f.columnName === "value" && f.tableName === tableName,
			)
			expect(fieldInState).toBeUndefined()

			// should delete field from db
			const fieldInDb = await fieldsRepo.findOne({
				where: { tableName: tableName, columnName: "value" },
			})
			expect(fieldInDb).toBeUndefined()

			// should delete column
			const exist = await schemaInfoService.hasColumn({ table: tableName, column: "value" })
			expect(exist).toEqual(false)

			// should remove field from repo
			const rawQuery = knexQuery.from(tableName).insert({ name: "test_delete" }).toQuery()
			await orm.rawQuery(rawQuery)
			const inDb = await orm.getRepo(collectionName).findWhere({})
			expect(inDb).toEqual([{ id: 1, name: "test_delete" }])
			expect(inDb[0]?.["value"]).toBeUndefined()

			// TODO not creating migrations currently
			// should create migration to delete
			// const migrations = await migrationsRepo.findWhere({
			// 	where: { name: { $like: `%__drop_column_${tableName}_value` } },
			// })
			// expect(migrations).toHaveLength(1)
		})
	})
})
