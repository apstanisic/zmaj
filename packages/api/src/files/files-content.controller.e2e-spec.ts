import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { StorageService } from "@api/storage/storage.service"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { INestApplication } from "@nestjs/common"
import {
	AuthUser,
	FileCollection,
	FileInfo,
	STORAGE_PROVIDER_HEADER,
	User,
	uuidRegex,
} from "@zmaj-js/common"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { PassThrough, Readable } from "node:stream"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { FilesService } from "./files.service"

const providerName = "minio_test"

describe("FilesContentController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	let filesRepo: OrmRepository<FileInfo>
	let storageService: StorageService
	let filesService: FilesService

	let user: User
	let file: FileInfo

	beforeAll(async () => {
		all = await getE2ETestModuleExpanded({
			storage: {
				enableFallbackStorage: false,
			},
			files: { generateCommonImageSizes: true, imageSizes: [{ name: "test", fit: "inside" }] },
		})
		app = all.app
		filesRepo = all.repo(FileCollection)
		storageService = app.get(StorageService)
		filesService = app.get(FilesService)
		user = await all.createUser()
	})

	afterAll(async () => {
		await all.deleteUser(user)
		await app.close()
	})

	async function deleteFiles(): Promise<void> {
		const files = await filesRepo.deleteWhere({
			where: { storageProvider: providerName, folderPath: "/test_content" },
		})
		for (const file of files) {
			await filesService.removeFileFromStorage(file)
		}
	}

	beforeEach(async () => {
		await deleteFiles()
		file = await createStubFile(filesService, 1000)
	})
	afterEach(async () => deleteFiles())

	async function createStubFile(service: FilesService, i: number): Promise<FileInfo> {
		const stream = new Readable()
		stream.push(`HelloWorld${i}`)
		stream.push(null)
		const index = i.toString().padStart(3, "0")
		const file = await service.uploadFile({
			fileName: `file_${index}.txt`,
			mimeType: "text/plain",
			storageProvider: providerName,
			req: CrudRequestStub({ collection: "zmajFiles" }),
			user: AuthUser.fromUser(user),
			file: stream,
			fileSize: 20,
			folder: "/test_content",
		})
		return file as FileInfo
	}

	it("e2e-should be defined", () => {
		expect(app).toBeDefined()
	})

	async function streamToBuffer(stream: Readable): Promise<Buffer> {
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}

		return Buffer.concat(chunks)
	}

	//
	describe("GET /files/:id/content", () => {
		it("should get file", async () => {
			// not ideal, but works
			const ps = new PassThrough()

			supertest(all.server()) //
				.get(`/api/files/${file.id}/content`)
				.auth(user.email, "password")
				.pipe(ps)

			const asBuffer = await streamToBuffer(ps)
			const asString = asBuffer.toString("utf-8")
			expect(asString).toEqual("HelloWorld1000")
		})

		it("should throw if forbidden", async () => {
			// not ideal, but works
			const ps = new PassThrough()
			supertest(all.server()) //
				.get(`/api/files/${file.id}/content`)
				//.auth(user.email, "password") // no auth
				.pipe(ps)

			const errorAsBuffer = await streamToBuffer(ps)
			const errorAsString = errorAsBuffer.toString("utf-8")
			expect(JSON.parse(errorAsString)).toEqual({
				error: {
					errorCode: 925219,
					message: "You do not have permission for this action",
					statusCode: 403,
					timestamp: expect.any(Number),
					// type: "Forbidden",
				},
			})
		})
	})

	/**
	 *
	 */
	describe("POST /files", () => {
		it("should upload file", async () => {
			const content = Buffer.from("HelloWorld5000", "utf-8")

			const res = await supertest(all.server()) //
				.post("/api/files")
				.attach("file", content, "file.txt")
				.set(STORAGE_PROVIDER_HEADER, providerName)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(201)
			expect(res.body.data).toBeDefined()
			expect(res.body.data.id).toMatch(uuidRegex)

			const inDb = await filesRepo.findById({ id: res.body.data.id })
			expect(inDb).toMatchObject({
				id: res.body.data.id,
				storageProvider: providerName,
				extension: "txt",
				mimeType: "text/plain",
				userId: user.id,
				folderPath: "/",
			} as FileInfo)

			expect(inDb.uri.includes(inDb.id)).toBe(true)

			const uploadedFile = await storageService.provider(inDb.storageProvider).getFile(inDb.uri)
			const asBuffer = await streamToBuffer(uploadedFile)
			expect(asBuffer.toString("utf-8")).toEqual("HelloWorld5000")
		})

		it("should generate images", async () => {
			const image = await readFile(`${__dirname}/__mocks__/mock-image.jpeg`)

			const res = await supertest(all.server()) //
				.post("/api/files")
				.attach("file", image, "mock_image.jpeg")
				.set(STORAGE_PROVIDER_HEADER, providerName)
				.auth(user.email, "password")

			const inDb = await filesRepo.findById({ id: res.body.data.id })

			const files = await storageService.provider(inDb.storageProvider).list(path.dirname(inDb.uri))

			const id = inDb.id

			expect(files.paths).toHaveLength(4)

			const paths = files.paths.sort()

			expect(paths.at(0)?.endsWith(`/${id}.jpeg`)).toEqual(true)
			expect(paths.at(1)?.endsWith(`/${id}_original.jpeg`)).toEqual(true)
			expect(paths.at(2)?.endsWith(`/${id}_test.jpeg`)).toEqual(true)
			expect(paths.at(3)?.endsWith(`/${id}_thumbnail.jpeg`)).toEqual(true)
		})
	})
})
