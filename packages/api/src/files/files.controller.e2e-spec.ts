import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { StorageService } from "@api/storage/storage.service"
import { getE2ETestModuleExpanded, TestBundle } from "@api/testing/e2e-test-module"
import { fixTestDate } from "@api/testing/stringify-date"
import { INestApplication } from "@nestjs/common"
import {
	AuthUser,
	FileCollection,
	FileInfo,
	FileUpdateDto,
	qsStringify,
	times,
	User,
} from "@zmaj-js/common"
import { Readable } from "node:stream"
import supertest from "supertest"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { FilesService } from "./files.service"

/**
 * @warn Debugging does not work currently for s3.
 * You must turn off catching uncaught exceptions to work
 * @see https://github.com/aws/aws-sdk-js-v3/issues/2263
 *
 * We could use local storage, but it's better to not touch local files
 *
 */

const providerName = "minio_test"

describe("FilesController e2e", () => {
	let all: TestBundle
	let app: INestApplication
	//
	let filesRepo: OrmRepository<FileInfo>
	let filesService: FilesService
	let storageService: StorageService
	//
	let user: User
	//
	let file: FileInfo

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
			folder: "/test_api",
		})
		return file as FileInfo
	}

	beforeAll(async () => {
		all = await getE2ETestModuleExpanded()
		app = all.app

		filesRepo = all.repo(FileCollection)
		filesService = app.get(FilesService)
		storageService = app.get(StorageService)

		user = await all.createUser()
	})

	afterAll(async () => {
		await all.deleteUser(user)
		await app.close()
	})

	async function deleteFiles(): Promise<void> {
		const files = await filesRepo.deleteWhere({
			where: { storageProvider: providerName, folderPath: "/test_api" },
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

	it("should compile", () => {
		expect(app).toBeDefined()
	})

	describe("GET /files/:id", () => {
		it("should get file by id", async () => {
			const res = await supertest(all.server())
				.get(`/api/files/${file.id}`)
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toEqual(fixTestDate(file))
		})
	})

	describe("GET /files", () => {
		let files: FileInfo[]

		beforeEach(async () => {
			files = await Promise.all(times(5, async (i) => createStubFile(filesService, i)))
		})

		it("should get files", async () => {
			const query = qsStringify({
				limit: 3,
				sort: { name: "ASC" },
				count: true,
				filter: {
					storageProvider: providerName,
					folderPath: "/test_api",
				},
			})
			const res = await supertest(all.server())
				.get(`/api/files?${query}`) //
				.auth(user.email, "password")

			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toHaveLength(3)
			// there is already one file created for every test, so it's 10 + 1
			expect(res.body.count).toEqual(6)
			expect(res.body.data).toEqual(files.slice(0, 3).map((f) => fixTestDate(f)))
		})
	})

	/**
	 *
	 */
	describe("DELETE /files/:id", () => {
		it("should delete and remove file", async () => {
			// file exists before in storage
			const existBefore = await storageService.provider(providerName).pathExists(file.uri)
			expect(existBefore).toEqual(true)

			const res = await supertest(all.server())
				.delete(`/api/files/${file.id}`)
				.auth(user.email, "password")

			// deleted file returned
			expect(res.statusCode).toBe(200)
			expect(res.body.data).toEqual(fixTestDate(file))

			// file info removed from db
			const inDb = await filesRepo.findOne({ where: { id: file.id } })
			expect(inDb).toBeUndefined()

			// file does not exist in storage
			const existAfter = await storageService.provider(providerName).pathExists(file.uri)
			expect(existAfter).toEqual(false)
		})
	})

	/**
	 *
	 */
	describe("PUT /files", () => {
		it("should update file", async () => {
			expect(file.description).not.toEqual("There is desc no")
			const dto = new FileUpdateDto({ description: "There is desc now" })

			const res = await supertest(all.server())
				.put(`/api/files/${file.id}`)
				.auth(user.email, "password")
				.send(dto)

			// updated file is returned
			expect(res.statusCode).toEqual(200)
			expect(res.body.data).toMatchObject(
				fixTestDate({ ...file, description: "There is desc now" }),
			)

			// updated file in db
			const inDb = await filesRepo.findById({ id: file.id })
			expect(inDb.description).toEqual("There is desc now")
		})
	})
})
