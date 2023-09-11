import { AuthorizationService } from "@api/authorization/authorization.service"
import { CrudRequest } from "@api/common/decorators/crud-request.type"
import { throw403, throw404, throw500 } from "@api/common/throw-http"
import { CrudCreateService } from "@api/crud/crud-create.service"
import type { CrudFinishEvent } from "@api/crud/crud-event.types"
import { OnCrudEvent } from "@api/crud/on-crud-event.decorator"
import { emsg } from "@api/errors"
import { StorageService } from "@api/storage/storage.service"
import { HttpException, Injectable, Logger } from "@nestjs/common"
import {
	AuthUser,
	FileCollection,
	FileInfo,
	FileModel,
	FileSchema,
	fileExtensionRegex,
	throwErr,
	zodCreate,
	type UUID,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { FileUploadDisabledError, StorageError } from "@zmaj-js/storage-core"
import { format } from "date-fns"
import path from "path"
import { Model } from "sequelize"
import { Readable } from "stream"
import { v4 } from "uuid"
import { ImagesService } from "./images.service"

@Injectable()
export class FilesService {
	logger = new Logger(FilesService.name)
	repo: OrmRepository<FileModel>
	constructor(
		public readonly crudCreate: CrudCreateService<FileInfo>,
		private readonly storageService: StorageService,
		private readonly authz: AuthorizationService,
		private readonly repoManager: RepoManager,
		private readonly imagesService: ImagesService,
		private readonly sqService: SequelizeService,
	) {
		this.repo = this.repoManager.getRepo(FileModel)
	}

	/**
	 * Get file from storage
	 */
	async getFile(params: {
		id: UUID
		user?: AuthUser
		size?: string
	}): Promise<{ data: Readable; info: FileInfo }> {
		const { id, user, size } = params

		// need info so we can set proper mime/type
		const fileInfo = await this.repo.findById({ id })
		if (!fileInfo) throw404(4381923, emsg.notFound("File"))

		// We only check if user can access file ID, if it can, he/she can access file
		this.authz.checkSystem("files", "read", { user, record: fileInfo }) ||
			throw403(8077881, emsg.noAuthz)

		const provider = this.storageService.provider(fileInfo.storageProvider)

		// no size requested, simply return file
		const result = size
			? await this.imagesService.getImage(fileInfo, size)
			: await provider.getFile(fileInfo.uri).catch(() => throw500(6907432))

		return { data: result, info: fileInfo }
	}

	/**
	 * All providers that allow upload
	 */
	getEnabledProviders(user?: AuthUser): string[] {
		const providers = this.storageService.enabledProviders

		return providers.filter((storageProvider) =>
			this.authz.checkSystem("files", "readStorageProviders", {
				user,
				record: <Partial<FileInfo>>{ storageProvider },
			}),
		)
	}

	async getFolders(user?: AuthUser): Promise<string[]> {
		// Need to use group by
		const paths = await this.sqService.orm
			.model(FileCollection.tableName)
			.findAll<Model<Pick<FileInfo, "folderPath">>>({
				group: "folderPath",
				attributes: ["folderPath"],
			})
			.then((r) => r.map((v) => v.getDataValue("folderPath")))

		return paths.filter((folderPath) =>
			this.authz.checkSystem("files", "readFolders", {
				user,
				record: { folderPath } satisfies Partial<FileInfo>,
			}),
		)
	}

	/**
	 * Create file in database, store in storage, and generate images possible
	 */
	async uploadFile(params: UploadFileParams): Promise<Partial<FileInfo>> {
		const { file, fileName, mimeType, user, fileSize, folder, storageProvider } = params
		const { name, ext } = path.parse(fileName)

		const allowed = this.authz.checkSystem("files", "create", {
			user,
			record: {
				fileSize: params.fileSize,
				mimeType: params.mimeType, //
				storageProvider: params.storageProvider,
			},
		})
		if (!allowed) throw403(492342, emsg.noAuthz)

		const extWithoutDot = ext.substring(1).toLowerCase()

		const extension = fileExtensionRegex.test(extWithoutDot) ? extWithoutDot : null

		const fileId = v4()

		const filePath = this.generateUri(fileId, extension)

		return this.repoManager.transaction({
			fn: async (em) => {
				const fileInfo = zodCreate(FileSchema, {
					mimeType,
					storageProvider,
					fileSize,
					name,
					uri: filePath,
					userId: user?.userId,
					folderPath: folder,
					extension, //remove leading dot. If it's '' it will remain ''
					// extension: trimStart(ext, "."), //remove leading dot. If it's '' it will remain ''
					id: fileId,
				})

				// Must use crud create, so event is emitted

				const created = await this.crudCreate.createOne(fileInfo, {
					collection: FileCollection,
					req: params.req,
					// ensure that same id is used, since we delete provided ids in dto
					factory: () => fileInfo,
					trx: em,
					user,
				})

				await this.storageService
					.provider(storageProvider)
					.upload({ path: fileInfo.uri, source: file })
					.catch((e) => {
						if (e instanceof HttpException) throwErr(e)
						if (e instanceof FileUploadDisabledError) throw403(7842323, emsg.uploadDisabled)
						if (e instanceof StorageError) throw e

						this.logger.error("File upload error", e)
						throw500(9722432)
					})

				// maybe ignore errors here. Or don't want for promise, let it finish in the background
				// maybe add queue
				await this.imagesService.createImagesFromFile(fileInfo)

				return created
			},
		})
	}

	/**
	 * Generate path for file to be saved
	 *
	 * It will be -> zmaj/files/2021/01/file-id/file-id.ext
	 * Every file should have it's folder, that way we can add compressed images in the same folder
	 *
	 * @param fileId File ID
	 * @param extension without dot
	 * @returns path where file should be saved
	 */
	generateUri(fileId: string, extension: string | null): string {
		// const { ext } = path.parse(extension)
		const yearMonth = format(new Date(), "yyyy/MM")
		const dir = `zmaj/files/${yearMonth}/${fileId}`
		return path.format({ dir, name: fileId, ext: extension ? `.${extension}` : "" })
	}

	async removeFileFromStorage(file: FileInfo): Promise<void> {
		const provider = this.storageService.provider(file.storageProvider)
		const folder = path.dirname(file.uri)
		await provider.deleteFolder(folder)
	}

	/**
	 * Hook that deletes file from storage after it's deleted from database
	 *
	 * We are doing this outside transaction, because we can't access file in app
	 * after it's deleted from db, so it's better to not hog db.
	 * We don't care if file deletion throws error, since we can just retry to delete file later.
	 * If S3 server is down, we want to allow user to delete image, and we will simply delete image
	 * from S3 after it's back up
	 */
	// @OnEvent("zmaj.collections.zmaj_files.delete.finish")
	@OnCrudEvent({ collection: FileCollection, action: "delete", type: "finish" })
	protected async __onFileDelete(event: CrudFinishEvent<FileInfo>): Promise<void> {
		const deletedFiles = event.result
		for (const file of deletedFiles) {
			// throw error if only one file, otherwise ignore, since we already deleted some files
			// it's better to have some files without link to db, then to have a link in db
			// without file. If we're deleting 3 files, and 1st is deleted, we can't revert deletion.
			// so it's best to delete what we can
			try {
				await this.removeFileFromStorage(file)
			} catch (error) {
				if (deletedFiles.length < 2) throw error
			}
		}
	}

	// async uploadByUrl({
	//   url,
	//   provider,
	//   meta,
	// }: {
	//   url: string;
	//   provider: string;
	//   meta: CrudMeta;
	// }): Promise<void> {
	//   if (typeof url !== 'string' || typeof provider !== 'string') {
	//     throw new BadRequestException('#1000');
	//   }
	//   if (!isURL(url)) throw new BadRequestException('Bad Url');

	//   const { data, headers } = await this.http.client
	//     .get(url, { responseType: 'stream' })
	//     // Make non nullable
	//     .then((v) => v!)
	//     .catch((e) => {
	//       throw new BadRequestException('#01823');
	//     });

	//   if (!(data instanceof Readable)) throw new BadRequestException('#4177');

	//   const saved = await this.uploadFile({
	//     file: data,
	//     provider,
	//     fileSize: headers['content-length'] ?? 1000,
	//     mimeType: headers['content-type'] ?? getType(url) ?? 'application/octet-stream',
	//     fileName: 'random',
	//     meta,
	//     //
	//   });
	//   data.destroy();
	// }
}

export type UploadFileParams = {
	file: Readable
	user?: AuthUser
	req: Pick<CrudRequest, "userAgent" | "ip">
	fileName: string
	mimeType: string
	fileSize: number
	storageProvider: string
	folder?: string
}
