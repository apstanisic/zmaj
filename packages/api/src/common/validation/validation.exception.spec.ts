import { HttpException } from "@nestjs/common"
import { throwErr } from "@zmaj-js/common"
import { beforeEach, describe, expect, it } from "vitest"
import { z, ZodError } from "zod"
import { ValidationException } from "./validation.exception"

describe("ValidationException", () => {
	let err: ZodError
	const schema = z.object({ name: z.string(), id: z.number().min(10) })

	beforeEach(() => {
		const res = schema.safeParse({ name: 5, id: 5 })
		if (res.success) throwErr("894237")
		err = res.error
	})

	it("should extend HttpException", () => {
		const error = new ValidationException(err)
		expect(error).toBeInstanceOf(HttpException)
	})

	it("should return get error response", () => {
		const error = new ValidationException(err)

		expect(error.getResponse()).toEqual({
			details: {
				id: "Number must be greater than or equal to 10",
				name: "Expected string, received number",
			},
			errorCode: 59903,
			// message: "Failed Validation",
			// first error is embedded in message
			message: 'Failed Validation. Field "name": Expected string, received number',
			statusCode: 400,
			timestamp: expect.any(Number),
		})
	})

	it("should default to 400 error", () => {
		const error = new ValidationException(err)
		expect(error.getStatus()).toEqual(400)
	})

	it("should allow to override http code", () => {
		const error = new ValidationException(err, { httpCode: 500 })
		expect(error.getStatus()).toEqual(500)
		expect(error.getResponse()).toMatchObject({
			statusCode: 500,
		})
	})

	it("should allow to override custom error code", () => {
		const error = new ValidationException(err, { zmajCode: 5012 })
		expect(error.getResponse()).toMatchObject({
			errorCode: 5012,
		})
	})
})
