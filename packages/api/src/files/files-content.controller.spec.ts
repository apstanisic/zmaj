import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException, InternalServerErrorException, StreamableFile } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { AuthUser, FileInfo, STORAGE_PROVIDER_HEADER, type UUID } from "@zmaj-js/common"
import { AuthUserStub, FileStub } from "@zmaj-js/test-utils"
import { Request, Response } from "express"
import { parseFormData } from "pechkin"
import { Readable } from "stream"
import { v4 } from "uuid"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ZodError } from "zod"
import { FilesContentController } from "./files-content.controller"
import { FilesService } from "./files.service"

vi.mock("busboy")
vi.mock("sharp", () => ({ default: vi.fn() }))
vi.mock("stream/promises")
vi.mock("pechkin", async () => ({
	...(await vi.importActual<typeof import("pechkin")>("pechkin")),
	parseFormData: vi.fn(),
}))

// Util to create async iterator for testing
async function* asyncIter<T = any>(data: T[]): AsyncGenerator<Awaited<T>, void, unknown> {
	for (const item of data) {
		const result = await Promise.resolve(item)
		yield result
	}
}

describe("FilesContentController", () => {
	let module: TestingModule
	let controller: FilesContentController
	let filesS: FilesService

	beforeEach(async () => {
		module = await buildTestModule(FilesContentController).compile()

		controller = module.get(FilesContentController)
		filesS = module.get(FilesService)
	})

	afterEach(async () => {
		await module.close()
	})

	it("should be compile", () => {
		expect(controller).toBeInstanceOf(FilesContentController)
	})

	describe("getFile", () => {
		const id: UUID = v4() as UUID
		let user: AuthUser
		let res: Response
		let file: { data: Readable; info: FileInfo }

		beforeEach(() => {
			user = AuthUserStub()
			file = { data: new Readable(), info: FileStub() }
			res = { set: vi.fn() } as any
			filesS.getFile = vi.fn().mockImplementation(async () => file)
		})
		afterEach(() => {
			file.data.destroy()
		})

		it("should get relevant file", async () => {
			await controller.getFile(res, id, user, "my_size")
			expect(filesS.getFile).toBeCalledWith({ id, user, size: "my_size" })
		})

		it("should return file", async () => {
			const mf = await controller.getFile(res, id, user)
			expect(mf).toBeInstanceOf(StreamableFile)
			expect(mf.getStream()).toEqual(file.data)
			// expect(pipeline).toBeCalledWith(file.data, res)
		})

		it("should set content type", async () => {
			await controller.getFile(res, id)
			expect(res.set).toBeCalledWith("Content-Type", file.info.mimeType)
		})
	})

	// This is missing a few tests,
	describe("upload", () => {
		const ip = "1.2.3.4"
		let user: AuthUser
		const userAgent = "my-user-agent"
		let req: Request
		let uploadedFile: FileInfo

		beforeEach(() => {
			user = AuthUserStub()
			req = {
				headers: {
					"content-length": "5000",
					"content-type": "image/jpeg",
					[STORAGE_PROVIDER_HEADER]: "provider1",
				},
			} as any
			uploadedFile = FileStub()
			filesS.uploadFile = vi.fn().mockResolvedValue(uploadedFile)
		})

		it("should throw if invalid headers are provided", async () => {
			req.headers["content-length"] = "invalid"
			await expect(controller.upload(req, ip, user, userAgent)).rejects.toThrow(ZodError)
		})

		it("should throw if there is more than 1 file", async () => {
			const iter = asyncIter<any>([{ field: "file" }, { field: "file" }])
			vi.mocked(parseFormData).mockResolvedValue({ fields: {}, files: iter })
			await expect(controller.upload(req, ip, user, userAgent)).rejects.toThrow(
				InternalServerErrorException,
			)
		})

		it("should throw if there is no filed", async () => {
			const iter = asyncIter<any>([])
			vi.mocked(parseFormData).mockResolvedValue({ fields: {}, files: iter })
			await expect(controller.upload(req, ip, user, userAgent)).rejects.toThrow(
				InternalServerErrorException,
			)
		})

		it("should respond with error if field is not 'file'", async () => {
			const iter = asyncIter<any>([{ field: "hello" }])
			vi.mocked(parseFormData).mockResolvedValue({ fields: {}, files: iter })
			await expect(controller.upload(req, ip, user, userAgent)).rejects.toThrow(BadRequestException)
		})

		it("should upload file", async () => {
			const iter = asyncIter<any>([
				{ field: "file", filename: "test", mimeType: "image/jpeg", stream: "stream" },
			])
			vi.mocked(parseFormData).mockResolvedValue({ fields: {}, files: iter })
			await controller.upload(req, ip, user, userAgent)
			expect(filesS.uploadFile).toBeCalledWith({
				req: { userAgent, ip },
				user,
				file: "stream",
				fileName: "test",
				mimeType: "image/jpeg",
				storageProvider: "provider1",
				fileSize: 5000,
			})
		})

		it("should respond with uploaded file", async () => {
			const iter = asyncIter<any>([
				{ field: "file", filename: "test", mimeType: "image/jpeg", stream: "stream" },
			])
			vi.mocked(parseFormData).mockResolvedValue({ fields: {}, files: iter })
			const res = await controller.upload(req, ip, user, userAgent)
			expect(res).toEqual({
				data: uploadedFile,
			})
		})
	})
})
