import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequestStub } from "@api/common/decorators/crud-request.stub"
import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { CrudCreateService } from "@api/crud/crud-create.service"
import { DeleteFinishEvent } from "@api/crud/crud-event.types"
import { DeleteFinishEventStub } from "@api/crud/__mocks__/delete-event.stubs"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { SequelizeService } from "@api/sequelize/sequelize.service"
import { StorageService } from "@api/storage/storage.service"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	BadRequestException,
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { asMock, AuthUser, FileCollection, FileInfo, Struct, times, UUID } from "@zmaj-js/common"
import { BaseStorage } from "@zmaj-js/storage-core"
import { AuthUserStub } from "@zmaj-js/test-utils"
import { set } from "date-fns"
import { Readable } from "stream"
import { Writable } from "type-fest"
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest"
import { FileStub } from "./file.stub"
import { FilesService } from "./files.service"
import { ImagesService } from "./images.service"

describe("FilesService", () => {
	let module: TestingModule
	let service: FilesService
	let storageService: Writable<StorageService>
	let authzService: Writable<AuthorizationService>
	let repoManager: RepoManager
	let imagesService: ImagesService
	let crudCreateService: CrudCreateService

	beforeEach(async () => {
		module = await buildTestModule(FilesService).compile()

		service = module.get(FilesService)
		storageService = module.get(StorageService)
		authzService = module.get(AuthorizationService)
		repoManager = module.get(RepoManager)
		// crudService = module.get(CrudService)
		crudCreateService = module.get(CrudCreateService)
		imagesService = module.get(ImagesService)
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(FilesService)
	})

	describe("repo", () => {
		it("should have valid repo", () => {
			expect(service.repo).toEqual({ testId: "REPO_zmaj_files" })
		})
	})

	/**
	 *
	 */
	describe("enabledProviders", () => {
		beforeEach(() => {
			storageService.enabledProviders = ["one", "two"]
			authzService.checkSystem = vi.fn().mockReturnValue(true)
		})

		it("should return enabled providers", () => {
			expect(service.getEnabledProviders()).toEqual(["one", "two"])
		})

		it("should return only providers user is allowed to see", () => {
			asMock(authzService.checkSystem).mockImplementation(
				(_, __, { record }: Struct<any>) => record.storageProvider !== "two",
			)
			expect(service.getEnabledProviders()).toEqual(["one"])
		})

		it("should get providers only for current user", () => {
			storageService.enabledProviders = ["one"]
			service.getEnabledProviders("user" as any)
			expect(authzService.checkSystem).toBeCalledWith("files", "readStorageProviders", {
				user: "user",
				record: {
					storageProvider: "one",
				},
			})
		})
	})

	/**
	 *
	 */
	describe("getFolders", () => {
		const findAll = vi.fn(async () =>
			["/hello", "/hello/world"].map((v) => ({ getDataValue: () => v })),
		)
		beforeEach(() => {
			authzService.checkSystem = vi.fn().mockReturnValue(true)
			const sq = module.get(SequelizeService)
			sq.orm = {} as any
			sq.orm.model = vi.fn().mockReturnValue({ findAll })
		})

		it("should run optimized query and get least amount of data", async () => {
			await service.getFolders()
			expect(findAll).toBeCalledWith({ group: "folderPath", attributes: ["folderPath"] })
		})

		it("should return enabled providers", async () => {
			const folders = await service.getFolders()
			expect(folders).toEqual(["/hello", "/hello/world"])
		})

		it("should return only providers user is allowed to see", async () => {
			asMock(authzService.checkSystem).mockImplementation(
				(_, __, { record }: Struct<any>) => record.folderPath !== "/hello",
			)
			const folders = await service.getFolders()
			expect(folders).toEqual(["/hello/world"])
		})

		it("should get providers only for current user", async () => {
			const user: any = "user"
			await service.getFolders(user)
			expect(authzService.checkSystem).nthCalledWith(1, "files", "readFolders", {
				user: "user",
				record: {
					folderPath: "/hello",
				},
			})
		})
	})

	/**
	 *
	 */
	describe("getFile", () => {
		let stream: Readable
		let fileInfo: FileInfo
		let user: AuthUser
		let getFile: Mock

		const fileId: UUID = "7458eaa7-347d-4d90-b904-be66d8a02d77" as UUID

		beforeEach(() => {
			stream = new Readable()
			fileInfo = FileStub()
			user = AuthUserStub()

			getFile = vi.fn().mockResolvedValue(stream)

			// storageProvider.getFile = vi.fn(async () => Result.ok(stream))

			service.repo.findById = vi.fn().mockResolvedValue(fileInfo)
			authzService.checkSystem = vi.fn().mockReturnValue(true)
			storageService.provider = vi.fn(() => ({ getFile })) as any
		})

		afterEach(() => {
			stream.destroy()
		})

		it("should throw if file does not exist in db", async () => {
			asMock(service.repo.findById).mockResolvedValue(undefined)
			await expect(service.getFile({ id: fileId, user })).rejects.toThrow(NotFoundException)
		})

		it("should throw if user does not have access to file", async () => {
			asMock(authzService.checkSystem).mockReturnValue(false)
			await expect(service.getFile({ id: fileId })).rejects.toThrow(ForbiddenException)
		})

		it("should throw if storage is unable to get file", async () => {
			getFile.mockRejectedValue(undefined)
			await expect(service.getFile({ id: fileId })).rejects.toThrow(InternalServerErrorException)
		})

		it("should return file stream and info", async () => {
			const result = await service.getFile({ id: fileId })
			expect(result.data).toEqual(stream)
			expect(result.info).toEqual(fileInfo)
		})
	})

	describe("generatePathInStorage", () => {
		it("should generate path", () => {
			// month is 0 based
			const date = set(new Date(), { year: 2022, month: 0 })
			vi.useFakeTimers()
			vi.setSystemTime(date)

			const path = service.generateUri("some-id", "jpg")
			expect(path).toEqual("zmaj/files/2022/01/some-id/some-id.jpg")

			vi.useRealTimers()
		})
	})

	describe("uploadFile", () => {
		let upload: Mock
		let file: Readable
		let req: CrudRequest

		beforeEach(() => {
			file = new Readable()
			req = CrudRequestStub()

			upload = vi.fn().mockResolvedValue(undefined)
			storageService.provider = vi.fn().mockReturnValue({ upload })
			repoManager.transaction = vi.fn(({ fn }) => fn("trx" as any))
			service.generateUri = vi.fn().mockReturnValue("my_path.jpg")
			crudCreateService.createOne = vi.fn(async () => ({}))
			imagesService.createImagesFromFile = vi.fn()
			authzService.checkSystem = vi.fn(() => true)
		})

		afterEach(() => {
			file.destroy()
		})

		it("should throw if action is not allowed", async () => {
			authzService.checkSystem = vi.fn(() => false)
			await expect(
				service.uploadFile({
					file,
					req,
					fileName: "my_name",
					fileSize: 10000,
					mimeType: "image/jpeg",
					storageProvider: "hello",
					user: req.user,
				}),
			).rejects.toThrow(ForbiddenException)
		})

		it("should upload file", async () => {
			await service.uploadFile({
				file,
				req,
				fileName: "my_name",
				fileSize: 10000,
				mimeType: "image/jpeg",
				storageProvider: "hello",
				user: req.user,
			})
			expect(storageService.provider).toBeCalledWith("hello")
			expect(upload).toBeCalledWith({ path: "my_path.jpg", source: file })
		})

		it("should generate images if possible", async () => {
			req.user = AuthUserStub()
			await service.uploadFile({
				file,
				req,
				fileName: "my_name.jpg",
				fileSize: 10000,
				mimeType: "image/jpeg",
				storageProvider: "hello",
				user: req.user,
			})
			expect(imagesService.createImagesFromFile).toBeCalledWith(
				expect.objectContaining({
					uri: "my_path.jpg",
					mimeType: "image/jpeg",
					storageProvider: "hello",
				}),
			)
		})

		it("should save file info", async () => {
			req.user = AuthUserStub()
			await service.uploadFile({
				file,
				req,
				fileName: "my_name.jpg",
				fileSize: 10000,
				mimeType: "image/jpeg",
				storageProvider: "hello",
				user: req.user,
			})
			expect(crudCreateService.createOne).toBeCalledWith(
				expect.objectContaining({
					uri: "my_path.jpg",
					storageProvider: "hello",
					fileSize: 10000,
					mimeType: "image/jpeg",
					userId: req.user?.userId,
					extension: "jpg",
				}),
				{
					req,
					factory: expect.any(Function),
					trx: "trx", //
					collection: FileCollection,
					user: req.user,
				},
			)
		})
	})

	/**
	 *
	 */
	describe("onFileDelete", () => {
		let deleted: FileInfo[]
		let event: DeleteFinishEvent<FileInfo>
		let provider: BaseStorage

		beforeEach(() => {
			deleted = times(5, (i) => FileStub({ uri: `hello/folder${i}/name${i}.txt` }))

			event = DeleteFinishEventStub({
				collection: FileCollection,
				result: deleted,
			})

			provider = {
				deleteFolder: vi.fn().mockResolvedValue(true), //
			} as any
			storageService.provider = vi.fn().mockReturnValue(provider)
		})

		it("should remove all deleted files from storage", async () => {
			await service["__onFileDelete"](event)
			expect(provider.deleteFolder).toBeCalledTimes(5)
			expect(provider.deleteFolder).nthCalledWith(1, "hello/folder0")
		})

		it("should isolate every error if there are more than 1 file", async () => {
			asMock(provider.deleteFolder).mockRejectedValueOnce(new Error())
			await service["__onFileDelete"](event)
			expect(provider.deleteFolder).toBeCalledTimes(5)
		})

		it("should throw if only one file is deleted", async () => {
			asMock(provider.deleteFolder).mockRejectedValueOnce(new BadRequestException())
			await expect(
				service["__onFileDelete"]({ ...event, result: deleted.slice(0, 1) }),
			).rejects.toThrow(BadRequestException)
		})
	})
})
