import type { UpdateAfterEvent } from "@api/crud/crud-event.types"
import { ReadFinishEventStub } from "@api/crud/__mocks__/read-event.stubs"
import { UpdateAfterEventStub, UpdateFinishEventStub } from "@api/crud/__mocks__/update-event.stubs"
import { HttpClient } from "@api/http-client/http-client.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { rand, randBoolean } from "@ngneat/falso"
import { asMock, throwErr, times } from "@zmaj-js/common"
import { AxiosRequestConfig } from "axios"
import { Writable } from "type-fest"
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { WebhookStub } from "@zmaj-js/test-utils"
import { WebhooksService } from "./webhooks.service"

describe("WebhooksService", () => {
	let service: WebhooksService
	let http: HttpClient

	beforeEach(async () => {
		const module = await buildTestModule(WebhooksService).compile()

		service = module.get(WebhooksService)
		//
		http = module.get(HttpClient)
		;(http as Writable<HttpClient>).client = { request: vi.fn(async () => ({})) } as any
		//
		service["allWebhooks"] = times(20, () => WebhookStub())
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(WebhooksService)
	})

	it("should have proper repo", () => {
		expect(service["repo"]).toEqual({ testId: "REPO_zmaj_webhooks" })
	})

	/**
	 *
	 */
	describe("onModuleInit", () => {
		let findWhere: Mock
		beforeEach(() => {
			findWhere = vi.fn()
			service["repo"].findWhere = findWhere
		})

		it("should fetch all hooks from db", async () => {
			await service.onModuleInit()
			expect(findWhere).toBeCalledWith({})
		})

		it("should store all hooks in memory", async () => {
			findWhere.mockResolvedValue([1, 2, 3])
			await service.onModuleInit()
			expect(service["allWebhooks"]).toEqual([1, 2, 3])
		})
	})

	/**
	 *
	 */
	describe("onWebhookChange", () => {
		beforeEach(() => {
			service["repo"].findWhere = vi.fn()
		})
		it("should update hooks after change", async () => {
			service.onModuleInit = vi.fn()
			const event = UpdateFinishEventStub()
			await service.__onWebhookChange(event)
			expect(service["repo"].findWhere).toBeCalledWith({ trx: event.trx })
		})

		it("should not update hooks after read event", async () => {
			service.onModuleInit = vi.fn()
			await service.__onWebhookChange(ReadFinishEventStub())
			expect(service.onModuleInit).not.toHaveBeenCalled()
		})
	})

	describe("fireWebhooks", () => {
		let event: UpdateAfterEvent

		beforeEach(() => {
			event = UpdateAfterEventStub()
		})

		it("should run only enabled hooks", async () => {
			const enabledHooks = service["allWebhooks"]
				.filter((wh) => wh.enabled)
				// make so every enabled hook is registered to current event
				.map((wh) => {
					wh.events = [`${event.action}.${event.collection.authzKey}`]
					return wh
				})
			await service.__fireWebhooks(event)
			expect(service["http"].client.request).toHaveBeenCalledTimes(enabledHooks.length)
		})

		it("should run hooks only for relevant event", async () => {
			service["allWebhooks"] = service["allWebhooks"].map((wh) => ({
				...wh,
				enabled: true,
				events: times(4, () =>
					[
						rand(["read", "update", "delete", "create"]),
						randBoolean() ? event.collection.authzKey : "collections.not_existing",
					].join("."),
				),
			}))
			const relevantHooks = service["allWebhooks"].filter((wh) =>
				wh.events.includes([event.action, event.collection.authzKey].join(".")),
			)
			await service.__fireWebhooks(event)
			expect(http.client.request).toHaveBeenCalledTimes(relevantHooks.length)
		})

		it("should send data only if enabled", async () => {
			service["allWebhooks"] = service["allWebhooks"].map((wh) => ({
				...wh,
				enabled: true,
				sendData: randBoolean(),
				events: [[event.action, event.collection.authzKey].join(".")],
				httpMethod: rand(["POST", "DELETE", "GET"]),
			}))

			await service.__fireWebhooks(event)

			service["allWebhooks"].forEach((wh, i) => {
				expect(http.client.request).nthCalledWith(i + 1, {
					method: wh.httpMethod,
					url: wh.url,
					headers: wh.httpHeaders,
					timeout: 5000,
					data: wh.sendData
						? {
								event: `${event.action}.${event.collection.authzKey}`,
								records: expect.anything(),
						  }
						: {},
				} as AxiosRequestConfig)

				//
			})
		})

		it("should ignore network errors", async () => {
			asMock(http.client.request).mockImplementation(async () => throwErr("3612822"))
			expect(async () => service.__fireWebhooks(event)).not.toThrow()
		})
	})
})
