import { zodCreate } from "@zmaj-js/common"
import { S3Storage, s3StorageConfigSchema } from "@zmaj-js/storage-s3"
import { describe, expect, it } from "vitest"

describe("Temp Testing", () => {
	it("should work with s3", async () => {
		try {
			const s3 = new S3Storage(
				zodCreate(s3StorageConfigSchema, {
					accessKey: "minio-key",
					bucket: "test-bucket",
					endpoint: "http://172.18.0.4:9000",
					name: "minio",
					region: "lg-test",
					secretKey: "minio-key",
					type: "s3",
					uploadDisabled: false,
				}),
			)
			expect(s3).toBeDefined()
		} catch (error) {
			expect(error).toEqual("err")
		}
		// const res = await s3
		//   .getFile(
		//     "zmaj/2022/08/0061d78b-7f4c-478d-8113-526f275613f3/0061d78b-7f4c-478d-8113-526f275613f3.jpg",
		//   )

		// expect(res).toBeDefined()
	})
})
