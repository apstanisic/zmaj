import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { StorageService } from "@api/storage/storage.service"
import { Injectable } from "@nestjs/common"
import { FileInfo, ImageExtension, isImageExtension, notNil } from "@zmaj-js/common"
import path from "path"
import sharp from "sharp"
import { Readable } from "stream"
import { FilesConfig, ImageSizeConfig } from "./files.config"

/**
 * Service that will upload image, and resize them to appropriate size
 * There is only 1 public method: `upload`. It will read config for sizes.
 * It will always create original size and thumbnail size
 * @todo What happens if the original image upload fails (thumb will be original, and next thumb...)
 */
@Injectable()
export class ImagesService {
	constructor(
		private storage: StorageService,
		private filesConfig: FilesConfig, //
	) {}

	/**
	 * This will take folder from og image, and add suffix to file name
	 * From `dir1/dir2/file.jpg` to `dir1/dir2/file_thumbnail.jpg`
	 */
	private getImagePath(params: { file: FileInfo; size: string }): string {
		const { file, size } = params
		// const dir = path.dirname(file.uri)
		const { ext, dir, name } = path.parse(file.uri)
		return path.format({ dir, ext, name: `${name}_${size}` })

		// return path.join(dir, `${file.id}_${size}.${file.extension}`)
	}

	// private isValidImageExtension(extension: string): extension is ImageExtension {
	//   return ["jpeg", "jpg", "png", "svg", "gif", "webp", "avif"].includes(extension)
	// }

	/**
	 *
	 * @param file File for which we want to get image
	 * @param size Size of the image we want
	 * @returns requested image
	 */
	async getImage(file: FileInfo, size: string): Promise<Readable> {
		// if size is not predefined, throw an error
		this.filesConfig.imageSizes.some((s) => s.name === size) ||
			throw400(72973, emsg.noImageSize(size))

		const imgPath = this.getImagePath({ file, size })

		const provider = this.storage.provider(file.storageProvider)

		const existInStorage = await provider.pathExists(imgPath)

		// create images if not provided
		if (!existInStorage) {
			const saved = await this.createImagesFromFile(file, [size])
			// requested image size on non image file
			if (!saved) throw400(792332, emsg.fileNotImage)
		}

		const result = await provider.getFile(imgPath).catch(() => throw500(9075432))
		return result

		//
	}

	/**
	 * It will generate all image sizes for provided file, if file is in supported image format
	 * If used as crud finish event, we can't use that stream, because that stream was destroyed
	 * after uploading file. So we have to stream file from storage.
	 *
	 * There is second param `sizes`, it's used when we only want specific sizes to generate
	 * @returns undefined if images cannot be generated for provided file
	 */
	async createImagesFromFile(fileInfo: FileInfo, sizes?: string[]): Promise<string[] | undefined> {
		const extension = fileInfo.extension

		// do nothing if not image
		if (!isImageExtension(extension)) return
		if (!fileInfo.mimeType.startsWith("image")) return

		const provider = this.storage.provider(fileInfo.storageProvider)
		const fileStream = await provider.getFile(fileInfo.uri)

		const sizeConfigs = sizes
			? sizes.map(
					(size) => this.filesConfig.imageSizes.find((s) => s.name === size) ?? throw500(32423),
			  )
			: this.filesConfig.imageSizes

		const resizingStreams = this.generateImageStreams({
			file: fileStream,
			extension,
			sizes: sizeConfigs,
		})

		const uploadingImages = resizingStreams.map(async ({ size, stream }) => {
			const path = this.getImagePath({ file: fileInfo, size })
			await provider.upload({ path, source: stream })
			return path
		})
		// // Ignore error, because we have uploaded file, we have to save
		const settled = await Promise.allSettled(uploadingImages)

		// // Return valid uploads
		return settled.map((p) => (p.status === "fulfilled" ? p.value : undefined)).filter(notNil)
	}

	private generateImageStreams({
		file,
		extension,
		sizes,
	}: {
		file: Readable
		extension: ImageExtension
		sizes: ImageSizeConfig[]
	}): { stream: Readable; size: string }[] {
		// https://github.com/lovell/sharp/issues/235#issuecomment-114483993
		const factory = sharp()
		file.pipe(factory)

		const streams = sizes.map((size) => {
			// TODO Add improvements to generated images, set good quality...
			// let item: sharp.Sharp
			// if (extension === "jpeg" || extension === "jpg") {
			// 	item = factory.jpeg({ mozjpeg: true, quality: 80 })
			// } else if (extension === '')
			return {
				size: size.name,
				stream: factory.toFormat(extension).clone().resize({
					fit: size.fit,
					height: size.height,
					width: size.width,
					withoutEnlargement: !size.shouldEnlarge,
					withoutReduction: false,
				}),
			}
		})

		return streams
	}

	/**
	 * @returns All sizes for which image should be generated. Original and thumbnail are generated
	 * by default. We are not throwing errors when invalid, because this allows us to break
	 * backwards comparability without affecting the app.
	 */
	// private async getImageSizes(): Promise<ImageSize[]> {
	//   const dbSizes = await this.keyVal.findByKey(SettingsKey.IMAGES_SIZES, "settings")

	//   const value = ignoreErrors(() => JSON.parse(dbSizes?.value ?? "["))
	//   if (!Array.isArray(value)) return this.requiredImageSizes

	//   const customSizes = value
	//     .map((customSize) => {
	//       const size = ImageSizeSchema.safeParse(customSize)
	//       return size.success ? size.data : undefined
	//     })
	//     .filter(notNil)

	//   return [...this.requiredImageSizes, ...customSizes]
	// }
	/**
	 * If additional sizes are added, or generation failed first time,
	 * we can try to generate images again.
	 */
	// async regenerateSizes(fileId: string, user?: AuthUser): Promise<ImageInfo[] | void> {
	//   const fileRepo = this.repoManager.getRepo(FileCollection)
	//   const file = await fileRepo.findById({ id: fileId })

	//   this.authz.checkSystem("files", "regenerateImages", { user, record: file }) ||
	//     throw403(7689237)

	//   if (!file) throw new NotFoundException("3032018")

	//   // If allowed
	//   await this.createImagesFromFile(file)
	// }

	// // @OnEvent("zmaj.collections.zmaj_files.create.finish")
	// @OnCrudEvent({ collection: FileCollection, action: "create", type: "after" })
	// // this is called before file is uploaded!!!
	// async onUploadFinish(event: CrudAfterEvent<FileInfo>): Promise<void> {
	//   // It will never happen, but just in case
	//   if (event.result.length !== 1) return
	//   const fileInfo = event.result[0]!

	//   // We don't care if image are not generated when file is uploaded. We still uploaded
	//   // original file
	//   try {
	//     await this.generateImagesFromFile(fileInfo)
	//   } catch (error) {
	//     this.logger.error("#08212", error)
	//   }
	// }
}
