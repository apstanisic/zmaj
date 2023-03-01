import { ResponseWithCount } from "@api/common"
import { GetCrudRequest, type CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { Controller, Delete, Get, Post, Put } from "@nestjs/common"
import { Data, endpoints, Struct } from "@zmaj-js/common"

const { userCollections: ep } = endpoints

@Controller(ep.$base)
export class CollectionsEndpointController {
	constructor(private readonly crud: CrudService<any>) {}

	/**
	 * Read item by ID
	 */
	@Get(ep.findById)
	async findById(@GetCrudRequest() req: CrudRequest): Promise<Data<Struct>> {
		return wrap(this.crud.findById(req))
	}

	/**
	 * Get many items
	 */
	@Get(ep.findMany)
	async findMany(@GetCrudRequest() req: CrudRequest): Promise<ResponseWithCount<Struct>> {
		return this.crud.findMany(req)
	}

	/**
	 * Create one item
	 */
	@Post(ep.create)
	async createOne(@GetCrudRequest() req: CrudRequest): Promise<Data<Struct>> {
		return wrap(this.crud.createOne(req))
	}

	/**
	 * Update item
	 */
	@Put(ep.updateById)
	async updateById(@GetCrudRequest() req: CrudRequest): Promise<Data<Struct>> {
		return wrap(this.crud.updateById(req))
	}

	/**
	 * Delete item by id
	 */
	@Delete(ep.deleteById)
	async deleteById(@GetCrudRequest() req: CrudRequest): Promise<Data<Struct>> {
		return wrap(this.crud.deleteById(req))
	}
}
