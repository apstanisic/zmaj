/* eslint-disable import/no-named-as-default-member */
import { BaseStorage, FilePropertiesSchema } from "@storage-core/base-storage"
import {
	FileAlreadyExistsError,
	FileNotFoundError,
	FileUploadDisabledError,
	InvalidFileError,
	StorageConfigError,
	StorageError,
} from "@storage-core/storage-errors"
import { asMock, isStruct, Struct } from "@zmaj-js/common"
import { fileTypeFromFile } from "file-type"
import fse from "fs-extra"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import { LocalStorageConfig } from "./local-storage-config.schema"
import { LocalFileStorage } from "./storage-local"

vi.mock("fs-extra")
vi.mock("file-type")
vi.mock("node:stream/promises")

describe("LocalFileStorage", () => {
	let params: LocalStorageConfig
	let storage: LocalFileStorage

	beforeEach(() => {
		params = new LocalStorageConfig({
			name: "test",
			type: "local",
			basePath: "/test",
			uploadDisabled: false,
		})

		storage = new LocalFileStorage(params)
	})

	it("should compile", () => {
		expect(storage).toBeInstanceOf(BaseStorage)
	})

	describe("fromStruct", () => {
		it("should create from general params", () => {
			const adapter = LocalFileStorage.fromStruct(params as any)
			expect(adapter).toBeInstanceOf(LocalFileStorage)
		})

		it("should throw on invalid config", () => {
			params.basePath = 5 as any
			expect(() => LocalFileStorage.fromStruct(params as any)).toThrow(StorageConfigError)
		})
	})

	describe("list", () => {
		beforeEach(() => {
			storage["isDirectory"] = vi.fn().mockResolvedValue(true)
		})
		it("should throw if not dir", async () => {
			storage["isDirectory"] = vi.fn().mockResolvedValue(false)
			await expect(storage.list("path")).rejects.toThrow(FileNotFoundError)
		})

		it("should throw our error on exception", async () => {
			asMock(fse.readdir).mockRejectedValue(new Error())
			await expect(storage.list("path")).rejects.toThrow(StorageError)
		})

		describe("read files recursively", () => {
			beforeEach(() => {
				const files = {
					path1: {
						path1a: "test",
						path1b: "value",
						path1c: {
							path1c1: "hello",
							path1c2: "hello",
						},
					},
					path2: "test",
					path3: {
						path3a1: "hello",
						path3a2: "hello",
						path3a3: "hello",
					},
				}
				asMock(fse.readdir).mockImplementation(async (path: string) => {
					const withoutSanitize = path.replace("/test/", "").split("/")

					// removed lodash
					// const data: Struct | string = get(files, withoutSanitize)
					let data: Struct | string = files
					withoutSanitize.forEach((section, i) => {
						data = (data as any)[section]
					})

					if (typeof data === "string") throw new Error()
					return Object.entries(data).map(([k, v]) => ({
						isDirectory: () => isStruct(v),
						isFile: () => typeof v === "string",
						name: k,
					}))
					//
				})
			})

			it("should read flat files", async () => {
				const res = await storage.list("path3")
				expect(res).toEqual({
					nativeResult: undefined,
					paths: ["/test/path3/path3a1", "/test/path3/path3a2", "/test/path3/path3a3"],
				})
			})

			it("should read folders recursively", async () => {
				const res = await storage.list("path1")
				expect(res).toEqual({
					nativeResult: undefined,
					paths: [
						"/test/path1/path1a",
						"/test/path1/path1b",
						"/test/path1/path1c/path1c1",
						"/test/path1/path1c/path1c2",
					],
				})
			})
		})
	})

	describe("info", () => {
		let stats: fse.Stats

		beforeEach(() => {
			stats = {
				size: 1000,
				mtime: new Date(),
				isDirectory: () => true,
				isFile: () => false,
			} as any
			asMock(fse.stat).mockImplementation(async () => stats)
		})
		//
		it("should return info about file", async () => {
			const res = await storage.info("path")
			expect(res).toEqual<z.infer<typeof FilePropertiesSchema>>({
				size: stats.size,
				lastModified: stats.mtime,
				type: undefined,
				nativeResult: expect.anything(),
				isDir: true,
				fullPath: "/test/path",
			})
		})

		it("it should throw if file does not exist", async () => {
			asMock(fse.stat).mockRejectedValue({ code: "ENOENT" })
			await expect(storage.info("path")).rejects.toThrow(FileNotFoundError)
		})

		it("it should throw if fs throws", async () => {
			asMock(fse.stat).mockRejectedValue({ code: "other" })
			await expect(storage.info("path")).rejects.toThrow(StorageError)
			//
		})

		it("should sanitize proper file", async () => {
			await storage.info("path")
			expect(fse.stat).toBeCalledWith("/test/path")
			//
		})

		it("should get mime type if possible", async () => {
			asMock(fileTypeFromFile).mockResolvedValue({ mime: "some/mime" })
			stats.isFile = vi.fn(() => true)
			const res = await storage.info("path")
			expect(res.type).toBe("some/mime")
			//
		})
	})

	describe("move", () => {
		beforeEach(() => {
			storage["transferPossible"] = vi
				.fn()
				.mockImplementation(async (source: string, dest: string) => ({
					source: `/test/${source}`,
					dest: `/test/${dest}`,
				}))
		})
		it("should move files", async () => {
			await storage.move("source", "dest")
			expect(fse.move).toBeCalledWith("/test/source", "/test/dest")
		})

		it("should throw on error", async () => {
			asMock(fse.move).mockRejectedValue(new Error())
			await expect(storage.move("source", "dest")).rejects.toThrow(StorageError)
		})
	})

	describe("copy", () => {
		beforeEach(() => {
			storage["transferPossible"] = vi
				.fn()
				.mockImplementation(async (source: string, dest: string) => ({
					source: `/test/${source}`,
					dest: `/test/${dest}`,
				}))
		})
		it("should copy files", async () => {
			await storage.copy("source", "dest")
			expect(fse.copy).toBeCalledWith("/test/source", "/test/dest")
		})

		it("should throw on error", async () => {
			asMock(fse.copy).mockRejectedValue(new Error())
			await expect(storage.copy("source", "dest")).rejects.toThrow(StorageError)
		})
	})

	describe("upload", () => {
		let buffer: Buffer

		beforeEach(() => {
			buffer = Buffer.from([])
			fse.ensureDir = vi.fn(async () => {})
		})

		it("should throw if upload is disabled", async () => {
			storage["uploadDisabled"] = true
			await expect(storage.upload({ path: "hello", source: buffer })).rejects.toThrow(
				FileUploadDisabledError,
			)
		})

		it("should throw if dest is taken", async () => {
			storage.pathExists = vi.fn().mockResolvedValue(true)
			await expect(storage.upload({ path: "hello", source: buffer })).rejects.toThrow(
				FileAlreadyExistsError,
			)
		})

		it("should throw if dest is taken", async () => {
			await storage.upload({ path: "hello/world", source: buffer })
			expect(fse.ensureDir).toBeCalledWith("/test/hello")
		})

		it("should throw on invalid source", async () => {
			await expect(storage.upload({ path: "hello", source: 5 as any })).rejects.toThrow(
				InvalidFileError,
			)
		})

		it("should upload stream", async () => {
			asMock(fse.createWriteStream).mockReturnValue("write-stream")
			const fileStream = new Readable()
			await storage.upload({ path: "hello/world", source: fileStream })
			expect(fse.createWriteStream).toBeCalledWith("/test/hello/world")
			expect(pipeline).toBeCalledWith(fileStream, "write-stream")
		})

		it("should upload buffer", async () => {
			await storage.upload({ path: "hello/world", source: buffer })
			expect(fse.writeFile).toBeCalledWith("/test/hello/world", buffer)
		})

		it("should upload string", async () => {
			await storage.upload({ path: "hello/world", source: "some-content" })
			expect(fse.writeFile).toBeCalledWith("/test/hello/world", "some-content")
		})
	})

	describe("getFileBuffer", () => {
		beforeEach(() => {
			asMock(fse.readFile).mockResolvedValue("file-buffer")
			storage.info = vi.fn().mockResolvedValue({ isDir: false })
		})

		it("should get file", async () => {
			const res = await storage.getFileBuffer("file-path")
			expect(res).toEqual("file-buffer")
		})

		it("should use sanitized path", async () => {
			await storage.getFileBuffer("file-path")
			expect(fse.readFile).toBeCalledWith("/test/file-path")
		})

		it("should throw if file does not exists", async () => {
			asMock(storage.info).mockRejectedValue(new StorageError())
			await expect(storage.getFileBuffer("file-path")).rejects.toThrow(StorageError)
		})

		it("should throw if file is folder", async () => {
			asMock(storage.info).mockResolvedValue({ isDir: true })
			await expect(storage.getFileBuffer("file-path")).rejects.toThrow(FileNotFoundError)
		})

		it("should throw our error", async () => {
			asMock(fse.readFile).mockRejectedValue(new Error())
			await expect(storage.getFileBuffer("file-path")).rejects.toThrow(StorageError)
		})
	})

	describe("getFile", () => {
		beforeEach(() => {
			asMock(fse.createReadStream).mockReturnValue("file-stream")
			storage.info = vi.fn().mockResolvedValue({ isDir: false })
		})

		it("should get file", async () => {
			const res = await storage.getFile("file-path")
			expect(res).toEqual("file-stream")
		})

		it("should use sanitized path", async () => {
			await storage.getFile("file-path")
			expect(fse.createReadStream).toBeCalledWith("/test/file-path")
		})

		it("should throw if file does not exists", async () => {
			asMock(storage.info).mockRejectedValue(new StorageError())
			await expect(storage.getFile("file-path")).rejects.toThrow(StorageError)
		})

		it("should throw if file is folder", async () => {
			asMock(storage.info).mockResolvedValue({ isDir: true })
			await expect(storage.getFile("file-path")).rejects.toThrow(FileNotFoundError)
		})
	})

	describe("delete", () => {
		it("should delete file", async () => {
			asMock(fse.remove).mockResolvedValue({})
			await storage.delete("val")
			expect(fse.remove).toBeCalledWith("/test/val")
		})

		it("should throw our error", async () => {
			asMock(fse.remove).mockRejectedValue(new Error())
			await expect(storage.delete("val")).rejects.toThrow(StorageError)
		})
	})

	describe("deleteMany", () => {
		beforeEach(() => {
			storage.delete = vi.fn().mockResolvedValue({})
		})
		it("should delete many files", async () => {
			await storage.deleteMany(["hello", "world"])
			expect(storage.delete).nthCalledWith(1, "hello")
			expect(storage.delete).nthCalledWith(2, "world")
		})
	})

	describe("pathExists", () => {
		beforeEach(() => {
			storage["sanitize"] = vi.fn().mockImplementation((v) => v)
		})

		it("should sanitize path before checking", async () => {
			asMock(fse.pathExists).mockResolvedValue("path-exists")
			asMock(storage["sanitize"]).mockImplementation((v) => `${v}1`)
			await storage.pathExists("hello")
			expect(fse.pathExists).toBeCalledWith("hello1")
		})

		it("should return true if path exists", async () => {
			asMock(fse.pathExists).mockResolvedValue("path-exists")
			const res = await storage.pathExists("hello")
			expect(res).toEqual("path-exists")
		})

		it("should throw our error", async () => {
			asMock(fse.pathExists).mockRejectedValue(new Error())
			await expect(storage.pathExists("hello")).rejects.toThrow(StorageError)
		})
	})

	describe("sanitize", () => {
		it("should throw if `..` are passed", () => {
			expect(() => storage["sanitize"]("hello/../world")).toThrow()
		})

		it("should return joined path", () => {
			const res = storage["sanitize"]("world")
			expect(res).toBe("/test/world")
		})
	})

	describe("isDirectory", () => {
		it("should return true if path is directory", async () => {
			storage.pathExists = vi.fn().mockResolvedValue(true)
			asMock(fse.stat).mockResolvedValue({ isDirectory: () => true })
			const res = await storage["isDirectory"]("hello")
			expect(res).toBe(true)
		})

		it("should return false if path does not exist", async () => {
			storage.pathExists = vi.fn().mockResolvedValue(false)
			const res = await storage["isDirectory"]("hello")
			expect(res).toBe(false)

			//
		})

		it("should return false if path is not dir", async () => {
			storage.pathExists = vi.fn().mockResolvedValue(true)
			asMock(fse.stat).mockResolvedValue({ isDirectory: () => false })
			const res = await storage["isDirectory"]("hello")
			expect(res).toBe(false)

			//
		})
	})

	describe("transferPossible", () => {
		beforeEach(() => {
			storage["sanitize"] = vi.fn().mockImplementation((v) => v)
			storage.pathExists = vi
				.fn()
				.mockImplementation(async (val: string) => (val.endsWith("source") ? true : false))
		})

		it("should sanitize paths", async () => {
			storage["sanitize"] = vi.fn().mockImplementation((v: string) => `test/${v}`)

			await storage["transferPossible"]("source", "dest")
			expect(storage.pathExists).nthCalledWith(1, "test/source")
			expect(storage.pathExists).nthCalledWith(2, "test/dest")
		})

		it("returned sanitized paths", async () => {
			storage["sanitize"] = vi.fn().mockImplementation((v: string) => `test/${v}`)

			const res = await storage["transferPossible"]("source", "dest")
			expect(res.source).toBe("test/source")
			expect(res.dest).toBe("test/dest")
		})

		it("should should throw if source does not exist", async () => {
			// dest is free as it should be, but source does not exist
			storage.pathExists = vi.fn().mockImplementation(async (_val: string) => false)
			await expect(storage["transferPossible"]("source", "dest")).rejects.toThrow(FileNotFoundError)
		})

		it("should should throw if dest is taken", async () => {
			// source exists, but dest also exists
			storage.pathExists = vi.fn().mockImplementation(async (_val: string) => true)
			await expect(storage["transferPossible"]("source", "dest")).rejects.toThrow(
				FileAlreadyExistsError,
			)
		})
	})
})
