import { expect, it } from "vitest"
import { S3Storage } from "./storage-s3"

it("should exist", () => {
	expect(S3Storage).toBeDefined()
})
