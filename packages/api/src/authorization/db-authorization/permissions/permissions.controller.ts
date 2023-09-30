import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { ResponseWithCount } from "@api/common"
import { GetCrudRequest, type CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { Controller, Delete, Get, Post, Put } from "@nestjs/common"
import {
	Data,
	Permission,
	PermissionCollection,
	PermissionCreateDto,
	PermissionUpdateDto,
	endpoints,
} from "@zmaj-js/common"
import { PartialDeep } from "type-fest"

const { permissions: ep } = endpoints

@SetCollection(PermissionCollection)
@Controller(ep.$base)
export class PermissionsController {
	constructor(private readonly crud: CrudService<Permission>) {}

	@SetSystemPermission("authorization", "read")
	@Get(ep.findById)
	async findById(@GetCrudRequest() req: CrudRequest): Promise<Data<PartialDeep<Permission>>> {
		return wrap(this.crud.findById(req))
	}

	@SetSystemPermission("authorization", "read")
	@Get(ep.findMany)
	async findMany(@GetCrudRequest() req: CrudRequest): Promise<ResponseWithCount<Permission>> {
		return this.crud.findMany(req)
	}

	@SetSystemPermission("authorization", "modify")
	@Post(ep.create)
	async createOne(
		@GetCrudRequest() req: CrudRequest,
		@DtoBody(PermissionCreateDto) dto: PermissionCreateDto,
	): Promise<Data<Partial<Permission>>> {
		return wrap(this.crud.createOne(req, { dto }))
	}

	@SetSystemPermission("authorization", "modify")
	@Put(ep.updateById)
	async updateById(
		@GetCrudRequest() req: CrudRequest,
		@DtoBody(PermissionUpdateDto) changes: PermissionUpdateDto,
	): Promise<Data<Partial<Permission>>> {
		return wrap(this.crud.updateById(req, { changes }))
	}

	@Delete(ep.deleteById)
	@SetSystemPermission("authorization", "modify")
	async deleteById(@GetCrudRequest() req: CrudRequest): Promise<Data<Partial<Permission>>> {
		return wrap(this.crud.deleteById(req))
	}
}
