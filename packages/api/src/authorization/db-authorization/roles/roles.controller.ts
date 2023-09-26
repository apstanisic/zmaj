import { ResponseWithCount } from "@api/common"
import { GetCrudRequest, type CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { throw403 } from "@api/common/throw-http"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { emsg } from "@api/errors"
import { Controller, Delete, Get, Post, Put } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	Data,
	PUBLIC_ROLE_ID,
	Role,
	RoleCollection,
	RoleCreateDto,
	RoleSchema,
	RoleUpdateDto,
	endpoints as allEndpoints,
} from "@zmaj-js/common"
import { PartialDeep } from "type-fest"
import { SetSystemPermission } from "../../set-system-permission.decorator"

const { roles: endpoints } = allEndpoints

@SetCollection(RoleCollection)
@Controller(endpoints.$base)
export class RolesController {
	constructor(private crud: CrudService<Role>) {}

	/**
	 * Find role by ID
	 *
	 * @param req CRUD Request
	 * @returns Relevant roles
	 */
	@SetSystemPermission("authorization", "read")
	@Get(endpoints.findById)
	async findById(@GetCrudRequest() req: CrudRequest): Promise<Data<PartialDeep<Role>>> {
		return wrap(this.crud.findById(req))
	}

	/**
	 * Find many roles
	 *
	 * @param req CRUD Request
	 * @returns Relevant roles
	 */
	@SetSystemPermission("authorization", "read")
	@Get(endpoints.findMany)
	async findMany(@GetCrudRequest() req: CrudRequest): Promise<ResponseWithCount<Role>> {
		return this.crud.findMany(req)
	}

	/**
	 * Create Role
	 *
	 * @param req CRUD Req
	 * @param dto Data to create
	 * @returns Created role
	 */
	@SetSystemPermission("authorization", "modify")
	@Post(endpoints.create)
	async createOne(
		@GetCrudRequest() req: CrudRequest,
		@DtoBody(RoleCreateDto) dto: RoleCreateDto,
	): Promise<Data<Partial<Role>>> {
		return wrap(this.crud.createOne(req, { dto, factory: RoleSchema }))
	}

	/**
	 * Update role by ID
	 *
	 * @param req CRUD Request
	 * @param changes Data that is used to update
	 * @returns Updated role
	 */
	@SetSystemPermission("authorization", "modify")
	@Put(endpoints.updateById)
	async updateById(
		@GetCrudRequest() req: CrudRequest,
		@DtoBody(RoleUpdateDto) changes: RoleUpdateDto,
	): Promise<Data<Partial<Role>>> {
		return wrap(this.crud.updateById(req, { changes }))
	}

	/**
	 * Delete role by Id
	 *
	 * @param req CRUD request
	 * @returns Deleted role
	 */
	@SetSystemPermission("authorization", "modify")
	@Delete(endpoints.deleteById)
	async deleteById(@GetCrudRequest() req: CrudRequest): Promise<Data<Partial<Role>>> {
		const id = req.recordId
		// can't delete system roles
		if (id === PUBLIC_ROLE_ID || id === ADMIN_ROLE_ID) throw403(512351, emsg.requiredRole)

		return wrap(this.crud.deleteById(req))
	}
}
