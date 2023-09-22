import { SdkError } from "@client-sdk/errors/sdk.error"
import { testEnsureCatch } from "@client-sdk/test-utils"
import { asMock, STORAGE_PROVIDER_HEADER, Struct, times } from "@zmaj-js/common"
import axios from "axios"
import { Blob } from "buffer"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CrudClient } from "./crud.client"
import { FilesClient } from "./files.client"

vi.mock("axios")

class FormDataMock {
	items: Struct = {}
	append(key: string, val: any): void {
		this.items[key] = val
	}
}

describe("FilesService", () => {
	let client: FilesClient

	beforeEach(() => {
		globalThis.window = { FormData: FormDataMock, Blob: Blob } as any
		client = new FilesClient(axios)
	})

	it("should extend CrudService", () => {
		expect(client).toBeInstanceOf(CrudClient)
	})

	describe("createOne", () => {
		it("should always throw", () => {
			expect(() => client.createOne()).toThrow()
		})
	})

	describe("getFolders", () => {
		it("should get folders", async () => {
			const folders = [1, 2, 3]
			asMock(axios.get).mockResolvedValue({ data: { data: folders } })
			const res = await client.getFolders()
			expect(res).toBe(folders)
			expect(axios.get).toBeCalledWith("/files/folders")
		})
		it("should catch axios error", () => {
			return testEnsureCatch({
				client: axios,
				fn: async () => client.getFolders(),
				// method: "get", //
			})
		})
	})

	describe("download", () => {
		it("should download file", async () => {
			const blob = new Blob([])
			asMock(axios.get).mockResolvedValue({ data: blob })
			const res = await client.download({ id: "ttt" })
			expect(res).toBe(blob)
		})

		it("should call proper url", async () => {
			const blob = new Blob([])
			asMock(axios.get).mockResolvedValue({ data: blob })
			const res = await client.download({ id: "some-id" })
			expect(axios.get).toBeCalledWith("/files/some-id/content", { responseType: "blob" })
		})

		it("should throw if blob is not returned", async () => {
			asMock(axios.get).mockResolvedValue({ data: "non blob" })
			await expect(client.download({ id: "ttt" })).rejects.toThrow(SdkError)
		})

		it("should catch axios error", async () => {
			return testEnsureCatch({
				client: axios,
				fn: async () => client.download({ id: "555" }),
			})
		})
	})

	describe("upload", () => {
		it("should call api properly", async () => {
			const file: any = { mockFile: "hello" }
			const onProgress = vi.fn()
			const signal: any = "signal value"
			asMock(axios.post).mockResolvedValue({ data: { data: "file-info" } })

			const resFile = await client.upload({ file: file, onProgress, signal })

			expect(axios.post).toBeCalledWith("/files", expect.anything(), {
				headers: undefined,
				signal,
				onUploadProgress: onProgress,
			})

			expect(resFile).toEqual("file-info")
		})

		it("should not send header if provider is not provided or is default", async () => {
			const file: any = { mockFile: "hello" }
			asMock(axios.post).mockResolvedValue({ data: { data: "file-info" } })
			await client.upload({ file, provider: "default" })
			expect(axios.post).toBeCalledWith(expect.anything(), expect.anything(), {
				headers: undefined,
				signal: undefined,
				onUploadProgress: undefined,
			})
		})

		it("should send header if provider is not default", async () => {
			const file: any = { mockFile: "hello" }
			asMock(axios.post).mockResolvedValue({ data: { data: "file-info" } })
			await client.upload({ file, provider: "not-default" })
			expect(axios.post).toBeCalledWith(expect.anything(), expect.anything(), {
				headers: { [STORAGE_PROVIDER_HEADER]: "not-default" },
				signal: undefined,
				onUploadProgress: undefined,
			})
		})

		it("should return created file", async () => {
			const file: any = { mockFile: "hello" }
			asMock(axios.post).mockResolvedValue({ data: { data: "file-info" } })
			const res = await client.upload({ file, provider: "not-default" })
			expect(res).toEqual("file-info")
		})

		it("should handle server errors", () => {
			const file: any = { mockFile: "hello" }
			asMock(axios.post).mockRejectedValue({})
			return testEnsureCatch({
				client: axios,
				fn: async () => client.upload({ file }),
				// method: "post",
			})
		})
	})

	describe("uploadMany", () => {
		it("should upload many files", async () => {
			const files: any[] = times(10, (i) => ({ id: i.toString() }))
			//
			client.upload = vi.fn().mockResolvedValue(5)
			const iter = client.uploadMany({ files })
			for await (const [file, err] of iter) {
				//
			}
			expect(client.upload).toBeCalledTimes(10)
		})
	})

	it("should handle error gracefully", async () => {
		const files: any[] = times(10, (i) => ({ id: i.toString() }))

		client.upload = vi
			.fn()
			.mockResolvedValueOnce(5)
			.mockRejectedValueOnce(new Error())
			.mockResolvedValue(10)
		//
		const iter = client.uploadMany({ files })

		let i = 0

		for await (const [file, err] of iter) {
			if (i === 0) {
				expect(file).toBe(5)
				expect(err).toBeNull()
			} else if (i === 1) {
				expect(file).toBe(null)
				expect(err).toBeInstanceOf(Error)
			} else {
				expect(file).toBe(10)
				expect(err).toBeNull()
			}
			i++
		}
	})

	it("should listen for abort signal", async () => {
		const files: any[] = times(10, (i) => ({ id: i.toString() }))

		client.upload = vi.fn().mockResolvedValueOnce(5)

		const signal = { aborted: false } as any

		const iter = client.uploadMany({ files, signal })

		let i = 0

		for await (const [file, err] of iter) {
			i++
			if (i === 4) signal.aborted = true
		}
		expect(client.upload).toBeCalledTimes(4)
	})

	/**
	 *
	 */
	describe("getStorageProviders", () => {
		it("should call api to get storage provider", async () => {
			asMock(axios.get).mockResolvedValue({ data: { data: "providers" } })
			const res = await client.getStorageProviders()
			expect(axios.get).toBeCalledWith("/files/providers")
			expect(res).toEqual("providers")
		})

		it("should throw http error", async () =>
			testEnsureCatch({ fn: async () => client.getStorageProviders(), client: axios }))
	})
})
