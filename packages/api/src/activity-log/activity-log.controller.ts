import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { ResponseWithCount } from "@api/common"
import { GetCrudRequest, type CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { Controller, Delete, Get } from "@nestjs/common"
import { ActivityLog, ActivityLogCollection, Data, endpoints } from "@zmaj-js/common"
import { PartialDeep } from "type-fest"

const ep = endpoints.activityLog
/**
 * Activity Log controller
 */
@SetCollection(ActivityLogCollection)
@Controller(ep.$base)
export class ActivityLogController {
	constructor(private service: CrudService<ActivityLog>) {}

	/**
	 * Get activity by ID
	 */
	@SetSystemPermission("activityLog", "read")
	@Get(ep.findById)
	async findById(@GetCrudRequest() meta: CrudRequest): Promise<Data<PartialDeep<ActivityLog>>> {
		return wrap(this.service.findById(meta))
	}

	/**
	 * Get activities
	 */
	@SetSystemPermission("activityLog", "read")
	@Get(ep.findMany)
	async findMany(@GetCrudRequest() meta: CrudRequest): Promise<ResponseWithCount<ActivityLog>> {
		return this.service.findMany(meta)
	}

	/**
	 * Delete activity
	 */
	@SetSystemPermission("activityLog", "delete")
	@Delete(ep.deleteById)
	async deleteById(@GetCrudRequest() meta: CrudRequest): Promise<Data<PartialDeep<ActivityLog>>> {
		return wrap(this.service.deleteById(meta))
	}
}
