import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

/**
 * ConfigModule is imported as null if not used importActual
 */
describe("AppController (e2e)", () => {
	let app: INestApplication

	beforeAll(async () => {
		app = await getE2ETestModule()
	})
	afterAll(async () => {
		await app.close()
	})

	it("should that app is defined", () => {
		expect(app).toBeDefined()
	})

	it("ensure e2e testing works", async () => {
		const res = await request(app.getHttpServer()).get("/api/true")
		expect(res.statusCode).toBe(404)
	})
})
