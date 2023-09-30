import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { ResponseWithCount } from "@api/common"
import type { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { GetCrudRequest } from "@api/common/decorators/crud-request.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { wrap } from "@api/common/wrap"
import { CrudService } from "@api/crud/crud.service"
import { Controller, Delete, Get, Post, Put } from "@nestjs/common"
import {
	Data,
	Webhook,
	WebhookCollection,
	WebhookCreateDto,
	WebhookSchema,
	WebhookUpdateDto,
	endpoints,
} from "@zmaj-js/common"
import { PartialDeep } from "type-fest"

const { webhooks: ep } = endpoints

/**
 * Webhook controller
 *
 * Be careful about SSRF (server side request forgery).
 * Since it sends http request to unknown addresses, it can send request to internal network
 * that is not intended to be consumed by public
 */
@Controller(ep.$base)
@SetCollection(WebhookCollection)
export class WebhooksController {
	constructor(private crud: CrudService<Webhook>) {}

	@Get(ep.findById)
	@SetSystemPermission("webhooks", "read")
	async findById(@GetCrudRequest() meta: CrudRequest): Promise<Data<PartialDeep<Webhook>>> {
		return wrap(this.crud.findById(meta))
	}

	@Get(ep.findMany)
	@SetSystemPermission("webhooks", "read")
	async findMany(@GetCrudRequest() meta: CrudRequest): Promise<ResponseWithCount<Webhook>> {
		return this.crud.findMany(meta)
	}

	@Post(ep.create)
	@SetSystemPermission("webhooks", "create")
	async createOne(
		@GetCrudRequest() meta: CrudRequest,
		@DtoBody(WebhookCreateDto) dto: WebhookCreateDto,
	): Promise<Data<Partial<Webhook>>> {
		return wrap(
			this.crud.createOne(meta, {
				dto,
				factory: WebhookSchema.omit({ id: true, createdAt: true }),
			}),
		)
	}

	@Put(ep.updateById)
	@SetSystemPermission("webhooks", "update")
	async updateById(
		@GetCrudRequest() meta: CrudRequest,
		@DtoBody(WebhookUpdateDto) changes: WebhookUpdateDto,
	): Promise<Data<Partial<Webhook>>> {
		return wrap(this.crud.updateById(meta, { changes }))
	}

	@Delete(ep.deleteById)
	@SetSystemPermission("webhooks", "delete")
	async deleteById(@GetCrudRequest() meta: CrudRequest): Promise<Data<Partial<Webhook>>> {
		return wrap(this.crud.deleteById(meta))
	}
}
