import { Readable } from "stream"
import { beforeEach, describe, expect, it } from "vitest"
import type { z } from "zod"
import { BaseStorage, FilePropertiesSchema } from "./base-storage"
import { StorageError } from "./storage-errors"

describe("BaseStorage", () => {
	let storage: BaseStorage
	beforeEach(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Force to enable to create abstract class
		storage = new BaseStorage({ uploadDisabled: false })
	})

	/**
	 *
	 */
	describe("streamToBuffer", () => {
		it("should convert stream to buffer", async () => {
			const stream = Readable.from(Buffer.from("hello world 123", "utf-8"))
			const result = await storage["streamToBuffer"](stream)

			expect(result).toBeInstanceOf(Buffer)
			expect(result.toString("utf-8")).toBe("hello world 123")
		})
	})

	/**
	 *
	 */
	describe("validFileProperties", () => {
		it("should throw error if data is invalid", () => {
			expect(() => storage["validFileProperties"]({ invalid: true })).toThrow(StorageError)
		})
		it("should return valid data", () => {
			const data: z.input<typeof FilePropertiesSchema> = {
				size: 5,
				type: "image/jpeg",
				lastModified: new Date(),
				fullPath: "/hello/world",
			}

			const result = storage["validFileProperties"](data)

			expect(result).toEqual({ ...data, isDir: false })
		})
	})
})
