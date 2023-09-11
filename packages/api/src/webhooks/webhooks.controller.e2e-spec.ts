import { HttpClient } from "@api/http-client/http-client.service"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import {
	qsStringify,
	times,
	User,
	Webhook,
	WebhookCreateDto,
	WebhookModel,
	WebhookUpdateDto,
} from "@zmaj-js/common"
import { OrmRepository } from "@zmaj-js/orm"
import { WebhookStub } from "@zmaj-js/test-utils"
import { omit } from "radash"
import supertest from "supertest"
import { v4 } from "uuid"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { WebhooksService } from "./webhooks.service"

describe("WebhooksController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	//
	let webhookService: WebhooksService
	let webhooksRepo: OrmRepository<WebhookModel>
	//
	let httpClient: HttpClient
	//
	let user: User

	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app

		webhookService = app.get(WebhooksService)
		httpClient = app.get(HttpClient)
		//
		webhooksRepo = all.repo(WebhookModel)
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(async () => {
		user = await all.createUser()
		httpClient.client.request = vi.fn().mockImplementation(async () => ({}))
		await webhooksRepo.deleteWhere({ where: {} })
	})

	afterEach(async () => {
		await all.deleteUser(user)
	})

	it("should be defined", () => {
		expect(app).toBeDefined()
	})

	describe("GET /system/webhooks", () => {
		it("should get webhooks", async () => {
			const webhooksStubs = times(12, () => WebhookStub({}))
			await webhooksRepo.createMany({ data: webhooksStubs, overrideCanCreate: true })

			const query = qsStringify({ limit: 5, count: true })
			const res = await supertest(all.server())
				.get(`/api/system/webhooks?${query}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(5)
			expect(res.body.count).toEqual(12)

			const data: Webhook[] = res.body.data
			const webhookIds = webhooksStubs.map((s) => s.id)
			data.forEach((wh) => {
				expect(webhookIds).toContain(wh.id)
			})
		})
	})

	describe("GET /system/webhooks/:id", () => {
		it("should get webhook by id", async () => {
			const webhook = WebhookStub()
			await webhooksRepo.createOne({ data: webhook, overrideCanCreate: true })

			const res = await supertest(all.server())
				.get(`/api/system/webhooks/${webhook.id}`)
				.auth(user.email, "password")

			expect(res.body.data).toEqual(fixTestDate(webhook))
		})
	})

	describe("DELETE /system/webhooks/:id", () => {
		it("should remove webhook by ID", async () => {
			const webhook = WebhookStub({
				enabled: true,
				events: ["create.collections.tags"],
				httpHeaders: { test: "header" },
				httpMethod: "GET",
				url: "http://example.com",
				sendData: false,
			})
			await webhooksRepo.createOne({ data: webhook, overrideCanCreate: true })
			await webhookService.onModuleInit()

			const tagRes = await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: "hello_tag1" })

			expect(tagRes.statusCode).toBe(201)

			expect(httpClient.client.request).nthCalledWith(1, {
				data: {},
				headers: {
					test: "header",
				},
				method: "GET",
				timeout: 5000,
				url: "http://example.com",
			})

			const res = await supertest(app.getHttpServer())
				.delete(`/api/system/webhooks/${webhook.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toBe(200)
			expect(res.body.data).toEqual(fixTestDate(webhook))

			const inDb = await webhooksRepo.findOne({ where: { id: webhook.id } })
			expect(inDb).toBeUndefined()

			const inState = webhookService["allWebhooks"].find((wh) => wh.id === webhook.id)
			expect(inState).toBeUndefined

			await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: "hello_tag2" })

			expect(httpClient.client.request).toBeCalledTimes(1)
		})
	})

	describe("POST /system/webhooks", () => {
		it("should create webhook", async () => {
			// test that there are not webhooks
			const createTag1 = await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: `hello_tag_${v4()}` })

			expect(createTag1.statusCode).toEqual(201)
			expect(httpClient.client.request).not.toBeCalled()

			const dto = new WebhookCreateDto({
				events: ["create.collections.tags"],
				enabled: true,
				httpMethod: "POST",
				sendData: true,
				httpHeaders: { test: "hello" },
				url: "http://example.com",
			})

			const res = await supertest(app.getHttpServer())
				.post("/api/system/webhooks")
				.auth(user.email, "password")
				.send(dto)

			// created webhook is returned
			expect(res.statusCode).toEqual(201)
			expect(res.body.data).toMatchObject(dto)

			// webhook is created
			const inDb = await webhooksRepo.findById({ id: res.body.data.id })
			expect(inDb).toBeDefined()

			// webhook is in state
			const inState = webhookService["allWebhooks"].at(-1)
			expect(inState).toMatchObject(inDb)

			const createTag2 = await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: `hello_tag_${v4()}` })

			// creating record triggers webhook
			expect(createTag2.statusCode).toEqual(201)
			expect(httpClient.client.request).toBeCalledWith({
				data: { records: [createTag2.body.data], event: dto.events[0]! },
				headers: {
					test: "hello",
				},
				method: "POST",
				timeout: 5000,
				url: "http://example.com",
			})
		})
	})

	describe("PUT /system/webhooks/:id", () => {
		let webhook: Webhook
		beforeEach(async () => {
			webhook = WebhookStub({
				enabled: false,
				events: ["create.collections.tags"],
				httpHeaders: { test: "header" },
				httpMethod: "GET",
				url: "http://example.com",
				sendData: false,
			})
			await webhooksRepo.createOne({ data: omit(webhook, ["createdAt"]) })
			await webhookService.onModuleInit()
		})

		it("should update webhook", async () => {
			// test that there are not webhooks
			const createTag1 = await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: `hello_tag_${v4()}` })

			expect(createTag1.statusCode).toEqual(201)
			expect(httpClient.client.request).not.toBeCalled()

			const dto = new WebhookUpdateDto({ enabled: true })

			const res = await supertest(app.getHttpServer())
				.put(`/api/system/webhooks/${webhook.id}`)
				.auth(user.email, "password")
				.send(dto)

			// updated webhook is returned
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(fixTestDate({ ...webhook, enabled: true }))

			// webhook is updated in db
			const inDb = await webhooksRepo.findById({ id: res.body.data.id })
			expect(inDb.enabled).toEqual(true)

			// webhook updated in state
			const inState = webhookService["allWebhooks"].find((wh) => wh.id === webhook.id)
			expect(inState).toMatchObject({ enabled: true })

			const createTag2 = await supertest(app.getHttpServer())
				.post("/api/collections/tags")
				.auth(user.email, "password")
				.send({ name: `hello_tag_${v4()}` })

			// creating record now triggers webhook
			expect(createTag2.statusCode).toEqual(201)
			expect(httpClient.client.request).toBeCalledWith({
				data: {},
				headers: {
					test: "header",
				},
				method: "GET",
				timeout: 5000,
				url: "http://example.com",
			})
		})
	})
})
