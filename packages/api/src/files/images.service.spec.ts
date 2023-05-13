import { StorageService } from "@api/storage/storage.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { TestingModule } from "@nestjs/testing"
import { asMock, FileInfo } from "@zmaj-js/common"
import { BaseStorage } from "@zmaj-js/storage-core"
import { FileStub } from "@zmaj-js/test-utils"
import sharp from "sharp"
import { Readable } from "stream"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FilesConfig, ImageSizeConfig } from "./files.config"
import { ImagesService } from "./images.service"

vi.mock("sharp", () => ({
	default: vi.fn().mockReturnThis(),
}))

describe("ImagesService", () => {
	let module: TestingModule
	let service: ImagesService
	let storageService: StorageService
	let filesConfig: FilesConfig
	//
	let fileStub: FileInfo

	const customSizes: ImageSizeConfig[] = [
		{ name: "abcd", height: 100, width: 100, fit: "contain", shouldEnlarge: false },
	]

	beforeEach(async () => {
		module = await buildTestModule(ImagesService, [
			{
				provide: FilesConfig,
				useValue: new FilesConfig({
					imageSizes: customSizes,
					generateCommonImageSizes: true,
				}),
			},
		]).compile()
		service = module.get(ImagesService)
		storageService = module.get(StorageService)
		filesConfig = module.get(FilesConfig)

		fileStub = FileStub({
			storageProvider: "pr1",
			extension: "jpg",
			mimeType: "image/jpeg",
			name: "my_file",
		})
	})

	it("should be defined", () => {
		expect(service).toBeInstanceOf(ImagesService)
	})

	describe("getImagePath", () => {
		it("should get proper path for image", () => {
			fileStub.uri = "hello/world/this/some-uuid.txt"
			const path = service["getImagePath"]({ size: "super", file: fileStub })
			expect(path).toEqual("hello/world/this/some-uuid_super.txt")
		})
	})

	// describe("isValidImageExtension", () => {
	//   it("should check if extension is valid", () => {
	//     expect(service["isValidImageExtension"]("jpg")).toBeTrue()
	//     expect(service["isValidImageExtension"]("jpeg")).toBeTrue()
	//     expect(service["isValidImageExtension"]("png")).toBeTrue()
	//     expect(service["isValidImageExtension"]("html")).toBeFalse()
	//     expect(service["isValidImageExtension"]("mp4")).toBeFalse()
	//     expect(service["isValidImageExtension"]("")).toBeFalse()
	//   })
	// })

	describe("generateImageStreams", () => {
		const resize = vi.fn(({ fit }) => `resized_${fit}`)
		const toFormat = vi.fn(() => ({ clone: vi.fn(() => ({ resize })) }))

		let mockFile: Readable

		beforeEach(() => {
			mockFile = { pipe: vi.fn() } as any
			asMock(sharp).mockImplementation(() => ({ toFormat }))
		})
		it("should pipe file to sharp", () => {
			service["generateImageStreams"]({ extension: "jpeg", file: mockFile, sizes: customSizes })
			expect(mockFile.pipe).toBeCalledWith({ toFormat })
		})

		it("should transform to proper format", () => {
			service["generateImageStreams"]({ extension: "jpeg", file: mockFile, sizes: customSizes })
			expect(toFormat).toBeCalledWith("jpeg")
		})

		it("should resize to proper sizes", () => {
			service["generateImageStreams"]({ extension: "jpeg", file: mockFile, sizes: customSizes })

			expect(resize).nthCalledWith(1, {
				fit: "contain",
				height: 100,
				width: 100,
				withoutEnlargement: true,
				withoutReduction: false,
			})
		})

		it("should have default sizes for original and thumbnail", () => {
			service["generateImageStreams"]({
				extension: "jpeg",
				file: mockFile,
				sizes: service["filesConfig"].imageSizes,
			})
			expect(resize).toBeCalledTimes(3)
		})

		it("should return size and image stream", () => {
			const res = service["generateImageStreams"]({
				extension: "jpeg",
				file: mockFile,
				sizes: service["filesConfig"].imageSizes,
			})
			expect(res).toEqual([
				{
					size: "original",
					stream: "resized_contain",
				},
				{
					size: "thumbnail",
					stream: "resized_cover",
				},
				{
					size: "abcd",
					stream: "resized_contain",
				},
			])
		})
	})

	describe("createImagesFromFile", () => {
		const getFile = vi.fn().mockImplementation(async () => "SOME_FILE")
		const upload = vi.fn().mockImplementation(async () => "UPLOADED")
		const provider = vi.fn().mockImplementation(() => ({ getFile, upload } as Partial<BaseStorage>))

		beforeEach(() => {
			storageService.provider = provider
			service["getImagePath"] = vi.fn(
				({ file, size }) => `folder/${file.name}_${size}.${file.extension}`,
			)
			service["generateImageStreams"] = vi.fn(({ file, sizes }) =>
				sizes.map((size) => ({ size: size.name, stream: `${file}_RESIZED` as any })),
			)
		})

		it("should do nothing if it does not have image extension", async () => {
			fileStub.extension = "txt"
			await service.createImagesFromFile(fileStub)
			expect(provider).not.toBeCalled()
		})

		it("should do nothing if it does not have valid mime type", async () => {
			fileStub.extension = "png"
			fileStub.mimeType = "application/json"
			await service.createImagesFromFile(fileStub)
			expect(provider).not.toBeCalled()
		})

		it("should generate and storage images from file", async () => {
			await service.createImagesFromFile(fileStub)

			expect(storageService.provider).toBeCalledWith("pr1")
			expect(getFile).toBeCalledWith(fileStub.uri)
			expect(service["generateImageStreams"]).toBeCalledWith({
				file: "SOME_FILE",
				extension: "jpg",
				sizes: filesConfig.imageSizes,
			})

			expect(upload).toBeCalledTimes(3)
			expect(upload).nthCalledWith(3, {
				path: "folder/my_file_abcd.jpg",
				source: "SOME_FILE_RESIZED",
			})
		})

		it("should pass sizes if provided", async () => {
			const res = await service.createImagesFromFile(fileStub, ["abcd"])
			expect(res).toEqual(["folder/my_file_abcd.jpg"])
		})

		it("should return uploaded images", async () => {
			const res = await service.createImagesFromFile(fileStub)
			expect(res).toEqual([
				"folder/my_file_original.jpg",
				"folder/my_file_thumbnail.jpg",
				"folder/my_file_abcd.jpg",
			])
		})

		it("should only return successfully uploaded images", async () => {
			upload.mockRejectedValueOnce(new Error())
			const res = await service.createImagesFromFile(fileStub)
			expect(res).toEqual(["folder/my_file_thumbnail.jpg", "folder/my_file_abcd.jpg"])
		})
	})

	describe("getImage", () => {
		beforeEach(() => {
			module.get(FilesConfig).imageSizes = [{ name: "thumb", fit: "contain", shouldEnlarge: false }]
		})

		it("should throw if size is not defined", async () => {
			module.get(FilesConfig).imageSizes = [{ name: "md", fit: "contain", shouldEnlarge: false }]
			await expect(service.getImage(fileStub, "thumb")).rejects.toThrow(BadRequestException)
		})

		it("should return image if exists", async () => {
			storageService.provider = vi.fn().mockImplementation(
				() =>
					({
						pathExists: vi.fn(async () => true),
						getFile: vi.fn(async () => "my_file" as any),
					} as Partial<BaseStorage>),
			)
			const res = await service.getImage(fileStub, "thumb")
			expect(res).toEqual("my_file")
		})

		it("should create image if it does not exist and return it", async () => {
			service.createImagesFromFile = vi.fn().mockResolvedValue(["hello"])
			storageService.provider = vi.fn().mockImplementation(
				() =>
					({
						pathExists: vi.fn(async () => false),
						getFile: vi.fn(async () => "my_image" as any),
					} as Partial<BaseStorage>),
			)
			const res = await service.getImage(fileStub, "thumb")
			expect(service.createImagesFromFile).toBeCalledWith(fileStub, ["thumb"])
			expect(res).toEqual("my_image")
		})
	})
})
