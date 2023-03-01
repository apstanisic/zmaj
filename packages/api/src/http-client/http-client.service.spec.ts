import { Test, TestingModule } from "@nestjs/testing"
import { beforeEach, describe, expect, it } from "vitest"
import { HttpClient } from "./http-client.service"

describe("MailService", () => {
	let service: HttpClient

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [HttpClient],
		}).compile()

		service = module.get(HttpClient)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	it("should have client property", () => {
		expect(service.client).toBeDefined()
		expect(service.client.request).toBeDefined()
	})
})
