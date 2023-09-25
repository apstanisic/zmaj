import { PostModel } from "@orm/example-models"
import { BaseModel } from "@orm/model/base-model"
import { describe, expectTypeOf, it } from "vitest"
import { ReturnedFieldProperties } from "./returned-field-properties"

describe("ReturnedFieldProperties", () => {
	const val = {} as ReturnedFieldProperties<PostModel, { id: true }, false>
	it("should omit relations", () => {
		// @ts-expect-error
		val.comments
		// @ts-expect-error
		val.writer
		// @ts-expect-error
		val.info
		// @ts-expect-error
		val.tags
	})

	it("should only return selected fields", () => {
		expectTypeOf<string>(val.id)
		// @ts-expect-error
		expectTypeOf<undefined>(val.id)

		expectTypeOf<string | undefined>(val.body)
		// @ts-expect-error
		expectTypeOf<string>(val.body)
	})

	it("should include hidden", () => {
		class Hidden extends BaseModel {
			name = "test"
			fields = this.buildFields((f) => ({
				firstName: f.text({}),
				lastName: f.text({ canRead: false }),
			}))
		}

		// Hide hidden
		const hide = {} as ReturnedFieldProperties<Hidden, { firstName: true; lastName: true }, false>
		// @ts-expect-error
		expectTypeOf<string>(hide.lastName)
		// @ts-expect-error
		expectTypeOf<undefined>(hide.lastName)
		expectTypeOf<string | undefined>(hide.lastName)

		// Show hidden
		const show = {} as ReturnedFieldProperties<Hidden, { firstName: true; lastName: true }, true>
		// @ts-expect-error
		expectTypeOf<undefined>(show.lastName)
	})
})
