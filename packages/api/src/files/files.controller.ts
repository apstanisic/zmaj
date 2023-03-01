import { GetUser } from "@api/authentication/get-user.decorator"
import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { ResponseWithCount } from "@api/common"
import { GetCrudRequest, type CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { Controller, Delete, Get, Put } from "@nestjs/common"
import {
	AuthUser,
	endpoints,
	FileCollection,
	FileInfo,
	FileUpdateDto,
	type Data,
} from "@zmaj-js/common"
import { PartialDeep } from "type-fest"
import { FilesService } from "./files.service"

const { files: ep } = endpoints
/**
 * Only file info, no content. See `files-content.controller.ts`
 */
@SetCollection(FileCollection)
@Controller(ep.$base)
export class FilesController {
	constructor(
		private readonly crud: CrudService<FileInfo>,
		private readonly filesService: FilesService,
	) {}

	/**
	 * Get all available providers
	 * @returns All providers where upload is enabled
	 */
	@SetSystemPermission("files", "readStorageProviders")
	@Get(ep.providers)
	getProviders(@GetUser() user?: AuthUser): Data<string[]> {
		return wrap(this.filesService.getEnabledProviders(user))
	}

	/**
	 * Get all folders providers
	 * @returns
	 */
	@SetSystemPermission("files", "readFolders")
	@Get("folders")
	async getFolders(@GetUser() user?: AuthUser): Promise<Data<string[]>> {
		return { data: await this.filesService.getFolders(user) }
	}

	/**
	 * Get info for specified file
	 */
	@SetSystemPermission("files", "read")
	@Get(ep.findById)
	async findById(@GetCrudRequest() req: CrudRequest): Promise<Data<PartialDeep<FileInfo>>> {
		return wrap(this.crud.findById(req))
	}

	/**
	 * Get files from db
	 * It returns info, not content (binary data)
	 */
	@SetSystemPermission("files", "read")
	@Get(ep.findMany)
	async findMany(@GetCrudRequest() req: CrudRequest): Promise<ResponseWithCount<FileInfo>> {
		return this.crud.findMany(req)
	}

	@Put(ep.updateById)
	@SetSystemPermission("files", "update")
	async updateById(
		@GetCrudRequest() req: CrudRequest,
		@DtoBody(FileUpdateDto) changes: FileUpdateDto,
	): Promise<Data<Partial<FileInfo>>> {
		return wrap(this.crud.updateById(req, { changes }))
	}

	/**
	 * Normal CRUD delete. There is an emitter hook that deletes file after CRUD completes.
	 */
	@SetSystemPermission("files", "delete")
	@Delete(ep.deleteById)
	async deleteById(@GetCrudRequest() req: CrudRequest): Promise<Data<Partial<FileInfo>>> {
		return wrap(this.crud.deleteById(req))
	}
}
