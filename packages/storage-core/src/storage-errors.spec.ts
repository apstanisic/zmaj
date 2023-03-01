import { beforeEach, describe, expect, it } from "vitest"
import { z, ZodError } from "zod"
import {
	FileAlreadyExistsError,
	FileNotFoundError,
	InvalidFilePathError,
	StorageConfigError,
	StorageProviderNotFound,
} from "./storage-errors"

describe("storage errors", () => {
	describe("StorageProviderNotFound", () => {
		it("should set storage provider name", () => {
			const err = new StorageProviderNotFound("test_provider")
			expect(err.message).toEqual(expect.stringContaining("test_provider"))
		})
	})

	describe("InvalidFilePathError", () => {
		it("should set path in the message", () => {
			const err = new InvalidFilePathError("/test/me")
			expect(err.message).toEqual(expect.stringContaining("/test/me"))
		})
	})

	describe("FileNotFoundError", () => {
		it("should set path in the message", () => {
			const err = new FileNotFoundError("/test/me")
			expect(err.message).toEqual(expect.stringContaining("/test/me"))
		})
	})

	describe("FileAlreadyExistsError", () => {
		it("should set path in the message", () => {
			const err = new FileAlreadyExistsError("/test/me")
			expect(err.message).toEqual(expect.stringContaining("/test/me"))
		})
	})

	describe("StorageConfigError", () => {
		let zodErr: ZodError
		beforeEach(() => {
			const zodRes = z.string().safeParse(555)
			if (zodRes.success) {
				throw new Error()
			}
			zodErr = zodRes.error
		})

		it("should pass zod error to current error", () => {
			const err = new StorageConfigError(zodErr)
			expect(err.message).toEqual(zodErr.message)
		})

		it("should pass zod error as cause", () => {
			const err = new StorageConfigError(zodErr)
			expect(err.cause).toEqual(zodErr)
		})
	})
})
