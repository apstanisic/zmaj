import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import { randEmail, randFirstName, randNumber, randPastDate } from "@ngneat/falso"
import { qsStringify, times, User, uuidRegex } from "@zmaj-js/common"
import { BaseModel, GetReadFields, OrmRepository } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { camel } from "radash"
import { DataTypes, QueryInterface } from "sequelize"
import supertest from "supertest"
import { v4 } from "uuid"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"

class TestPersonModel extends BaseModel {
	name = "tp"

	fields = this.buildFields((f) => ({
		id: f.text({}),
		name: f.text({}),
		email: f.text({}),
		birthday: f.dateTime({}),
		postsCount: f.int({}),
	}))
}

type TestPerson = GetReadFields<TestPersonModel, false>

describe("CollectionsEndpoint e2e", () => {
	let all: TestBundle
	let app: INestApplication
	//
	let repo: OrmRepository<TestPersonModel>
	let qi: QueryInterface
	//
	let user: User

	const tableName = "endpoint_test_persons"
	const collectionName = camel(tableName)

	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app
		qi = app.get(SequelizeService).qi

		await all.changeInfra(async () => {
			await qi.dropTable(tableName)

			await qi.createTable(tableName, {
				id: { type: DataTypes.UUID, primaryKey: true },
				name: DataTypes.STRING,
				email: DataTypes.STRING,
				birthday: DataTypes.DATE(3),
				posts_count: DataTypes.INTEGER,
			})
		})

		repo = all.repo<TestPersonModel>(collectionName)
	})

	afterAll(async () => {
		await qi.dropTable(tableName)
		await app.close()
	})

	beforeEach(async () => {
		user = await all.createUser()
		await repo.deleteWhere({ where: {} })
	})

	afterEach(async () => {
		await repo.deleteWhere({ where: {} })
		all.deleteUser(user)
	})

	function stubRow(): TestPerson {
		return {
			id: v4(),
			name: randFirstName(),
			email: randEmail({ suffix: "test" }),
			birthday: randPastDate(),
			postsCount: randNumber(),
		}
	}
	/**
	 *
	 */
	describe("GET /collections/:collection", () => {
		let rows: TestPerson[]
		beforeEach(async () => {
			rows = await repo.createMany({ data: times(15, stubRow) })
		})
		it("should get many records", async () => {
			const query = qsStringify({
				count: true,
				limit: 4,
				filter: { email: { $like: "%.test" } },
			})

			const res = await supertest(app.getHttpServer())
				.get(`/api/collections/${collectionName}?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.count).toEqual(15)
			expect(res.body.data).toEqual(fixTestDate(rows.slice(0, 4)))
		})
	})

	/**
	 *
	 */
	describe("GET /collections/:collection/:id", () => {
		let person: TestPerson
		beforeEach(async () => {
			person = await repo.createOne({ data: stubRow() })
		})
		it("should get record", async () => {
			const res = await supertest(app.getHttpServer())
				.get(`/api/collections/${collectionName}/${person.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toEqual(fixTestDate(person))
		})
	})

	/**
	 *
	 */
	describe("POST /collections/:collection", () => {
		it("should create record", async () => {
			const stub = stubRow()
			const res = await supertest(app.getHttpServer())
				.post(`/api/collections/${collectionName}`)
				.auth(user.email, "password")
				.send(stub)

			expect(res.statusCode).toEqual(201)
			expect(res.body.data).toEqual({
				...fixTestDate(stub),
				id: expect.stringMatching(uuidRegex), // id can't be provided
			})
			const inDb = await repo.findWhere({ where: { id: res.body.data.id } })
			expect(fixTestDate(inDb)).toEqual([res.body.data])
		})
	})

	/**
	 *
	 */
	describe("DELETE /collections/:collection/:id", () => {
		let stub: TestPerson
		beforeEach(async () => {
			stub = await repo.createOne({ data: stubRow() })
		})
		it("should delete record", async () => {
			const inDbBefore = await repo.findWhere({ where: { id: stub.id } })
			expect(inDbBefore).toHaveLength(1)

			const res = await supertest(app.getHttpServer())
				.delete(`/api/collections/${collectionName}/${stub.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toEqual(fixTestDate(stub))
			const inDb = await repo.findWhere({ where: { id: stub.id } })
			expect(inDb).toHaveLength(0)
		})
	})

	/**
	 *
	 */
	describe("UPDATE /collections/:collection/:id", () => {
		let stub: TestPerson
		beforeEach(async () => {
			stub = await repo.createOne({ data: stubRow() })
		})
		it("should update record", async () => {
			const res = await supertest(app.getHttpServer())
				.put(`/api/collections/${collectionName}/${stub.id}`)
				.auth(user.email, "password")
				.send({ name: "new_name_for_test_endpoint" })

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject({ id: stub.id, name: "new_name_for_test_endpoint" })
			const inDb = await repo.findWhere({ where: { id: stub.id } })
			expect(inDb[0]).toMatchObject({ id: stub.id, name: "new_name_for_test_endpoint" })
		})
	})
})
