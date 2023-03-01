import { GetUser } from "@api/authentication/get-user.decorator"
import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { throw400, throw500 } from "@api/common/throw-http"
import { wrap } from "@api/common/wrap"
import { emsg } from "@api/errors"
import {
	Controller,
	Get,
	Ip,
	Logger,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	Req,
	Res,
	StreamableFile,
} from "@nestjs/common"
import {
	AuthUser,
	endpoints,
	FileCollection,
	FileInfo,
	STORAGE_PROVIDER_HEADER,
	type UUID,
} from "@zmaj-js/common"
import type { Request, Response } from "express"
import { parseFormData } from "pechkin"
import { z } from "zod"
import { FilesConfig } from "./files.config"
import { FilesService } from "./files.service"

/**
 * since headers must be string, we checked it value is valid number, and then
 * transformed it back to string, so we just convert it again to int
 * `catchall` allows to keep other headers
 */
const FileUploadHeadersSchema = z
	.object({
		"content-length": z.coerce.number().int().min(1).finite(),
		"content-type": z.string().min(1).max(300),
		[STORAGE_PROVIDER_HEADER]: z.string().min(1).max(100).default("default"),
	})
	.catchall(z.string().or(z.array(z.string())).optional())

const { files: ep } = endpoints

/**
 * Using
 */
@SetCollection(FileCollection)
@Controller(ep.$base)
export class FilesContentController {
	logger = new Logger(FilesContentController.name)
	constructor(
		private readonly filesService: FilesService, //
		private readonly fileConfig: FilesConfig,
	) {}

	/**
	 * If there is problem with streaming, switch from `StreamableFile` to `pipeline`, see git history
	 */
	@SetSystemPermission("files", "read")
	@Get(ep.download)
	async getFile(
		@Res({ passthrough: true }) res: Response,
		@Param("id", ParseUUIDPipe) id: UUID,
		@GetUser() user?: AuthUser,
		@Query("size") size?: string,
	): Promise<StreamableFile> {
		const file = await this.filesService.getFile({ id, user, size })
		// set content type so it renders image normally
		res.set("Content-Type", file.info.mimeType)
		// First does not show error in terminal when testing, other 2 show
		// file.data.pipe(res)
		// await pipeline(file.data, res)
		return new StreamableFile(file.data)
	}

	/**
	 * This is new implementation that uses `pechkin` for handling streams.
	 * It's built on top of busboy, but provides much better API.
	 * I'm not sure if error handling works, but all tests are passing.
	 * I'm leaving original busboy implementation without api endpoint so I can
	 * switch in case of problems
	 */

	@SetSystemPermission("files", "create")
	@Post(ep.upload)
	async upload(
		@Req() req: Request,
		@Ip() ip: string,
		@GetUser() user?: AuthUser,
		@UserAgent() userAgent?: string,
	): Promise<{ data: Partial<FileInfo> }> {
		const headers = FileUploadHeadersSchema.parse(req.headers)

		const { files } = await parseFormData(req, {
			abortOnFileByteLengthLimit: true,
			maxFileByteLength: this.fileConfig.maxUploadSize,
			// no non file fields
			maxTotalFieldCount: 0,
			// only 1 file can be uploaded
			maxTotalFileCount: 1,
		})

		let uploadedFile: Partial<FileInfo> | undefined

		for await (const file of files) {
			if (uploadedFile) throw500(397678)
			if (file.field !== "file") throw400(7832444, emsg.badFileField)
			const fileName = file.filename ?? "zmaj-file"

			// Add someway to use this value for size, since it's safe
			// file.byteLength

			uploadedFile = await this.filesService.uploadFile({
				user,
				file: file.stream,
				fileName,
				mimeType: file.mimeType,
				req: { ip, userAgent },
				fileSize: headers["content-length"],
				storageProvider: headers[STORAGE_PROVIDER_HEADER],
			})
		}

		if (!uploadedFile) throw500(37823423)
		return wrap(uploadedFile)
	}
}
