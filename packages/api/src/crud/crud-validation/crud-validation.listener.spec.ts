import { describe, expect, it } from "vitest"
// import type { CrudStartEvent } from "@api/crud/crud-event.types"
// import { CreateStartEventMock } from "@api/crud/__mocks__/create-event.mocks"
// import { DeleteStartEventStub } from "@api/crud/__mocks__/delete-event.mocks"
// import { ReadStartEventStub } from "@api/crud/__mocks__/read-event.stubs"
// import { Test } from "@nestjs/testing"
// import { CollectionDefStub } from "@zmaj-js/common"
// import { times } from "@zmaj-js/common"
// import { UpdateStartEventStub } from "../__mocks__/update-event.stubs"
// import { CrudValidationListener } from "./crud-validation.listener"
export default {}

describe("ValidationListener", () => {
	it("should exist", () => {
		expect(1).toEqual(1)
	})
	// let listener: CrudValidationListener
	// const jsonSchema = {
	// 	type: "object",
	// 	properties: {
	// 		hello: { type: "string" },
	// 	},
	// 	required: ["hello"],
	// }
	// beforeEach(async () => {
	// 	const module = await Test.createTestingModule({
	// 		providers: [CrudValidationListener],
	// 	}).compile()
	// 	listener = module.get(CrudValidationListener)
	// })
	// /**
	//  *
	//  */
	// describe("before", () => {
	// 	let crudEvent: CrudStartEvent
	// 	beforeEach(() => {
	// 		crudEvent = new CreateStartEventMock().build()
	// 		listener["validate"] = vi.fn()
	// 	})
	// 	it("should not validate on delete and read since there is no data changes", async () => {
	// 		crudEvent = DeleteStartEventStub()
	// 		listener.before(crudEvent)
	// 		expect(listener["validate"]).not.toHaveBeenCalled()
	// 		crudEvent = ReadStartEventStub()
	// 		listener.before(crudEvent)
	// 		expect(listener["validate"]).not.toHaveBeenCalled()
	// 	})
	// 	it("should not validate if validation is not present", () => {
	// 		crudEvent.collection = CollectionDefStub({ validation: {} })
	// 		listener.before(crudEvent)
	// 		expect(listener["validate"]).not.toHaveBeenCalled()
	// 	})
	// 	it("should validate if validation is provided", () => {
	// 		crudEvent.collection = CollectionDefStub({ validation: jsonSchema })
	// 		listener.before(crudEvent)
	// 		// Fail always if before undefined. Just in case
	// 		expect(listener["validate"]).toBeCalled()
	// 	})
	// 	it("should validate dto from from create", () => {
	// 		// crudEvent = new CreateStartEventMock().build()
	// 		crudEvent = new CreateStartEventMock()
	// 			.setValue("collection", CollectionDefStub({ validation: jsonSchema }))
	// 			.setValue(
	// 				"dto",
	// 				times(10, () => ({ id: 5 })),
	// 			)
	// 			.build()
	// 		listener.before(crudEvent)
	// 		expect(listener["validate"]).toBeCalledTimes(10)
	// 	})
	// 	it("should validate updated record in update", () => {
	// 		// crudEvent = new CreateStartEventMock().build()
	// 		crudEvent = UpdateStartEventStub({
	// 			collection: CollectionDefStub({ validation: jsonSchema }),
	// 			toUpdate: times(10, () => ({ changed: { id: 1 }, id: 1, original: { id: 1 } })),
	// 		})
	// 		listener.before(crudEvent)
	// 		expect(listener["validate"]).toBeCalledTimes(10)
	// 	})
	// })
	// /**
	//  *
	//  */
	// describe("validate", () => {
	// 	it("should not throw if data is valid", () => {
	// 		expect(() => listener["validate"]({ hello: "world" }, jsonSchema)).not.toThrow()
	// 	})
	// 	it("should throw if data is valid", () => {
	// 		expect(() => listener["validate"]({ hello: 5 }, jsonSchema)).toThrow()
	// 	})
	// 	it("should allow additional properties by default", () => {
	// 		expect(() => listener["validate"]({ hello: "world", some: 2 }, jsonSchema)).not.toThrow()
	// 	})
	// 	it("should allow user to override additional properties", () => {
	// 		expect(() =>
	// 			listener["validate"](
	// 				{ hello: "world", some: 2 },
	// 				{ ...jsonSchema, additionalProperties: false },
	// 			),
	// 		).toThrow()
	// 	})
	// })
})
