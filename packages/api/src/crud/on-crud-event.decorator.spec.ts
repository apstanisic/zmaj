import { OnEvent } from "@nestjs/event-emitter"
import { describe, expect, it, vi } from "vitest"
import { getCrudEmitKey } from "./get-crud-emit-key"
import { OnCrudEvent } from "./on-crud-event.decorator"

vi.mock("@nestjs/event-emitter", () => ({
	OnEvent: vi.fn(() => "on_event_decorator_result"),
}))

vi.mock("./get-crud-emit-key", () => ({
	getCrudEmitKey: vi.fn(() => "crud-key"),
}))

describe("OnCrudEvent", () => {
	it("should return OnEventDecorator", () => {
		const res = OnCrudEvent({})
		expect(res).toEqual("on_event_decorator_result")
	})

	it("should get proper key", () => {
		const params = { action: "read", type: "before", collection: "posts" } as const
		OnCrudEvent(params)
		expect(getCrudEmitKey).toBeCalledWith(params)
		expect(OnEvent).toBeCalledWith("crud-key")
	})

	it("should have default value as *", () => {
		OnCrudEvent({})
		expect(getCrudEmitKey).toBeCalledWith({ action: "*", type: "*", collection: "*" })
	})
})
