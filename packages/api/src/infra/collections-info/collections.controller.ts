import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { wrap } from "@api/common/wrap"
import { Controller, Delete, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import type { Data, UUID } from "@zmaj-js/common"
import {
	endpoints,
	CollectionMetadata,
	CollectionCreateDto,
	CollectionUpdateDto,
} from "@zmaj-js/common"
import { CollectionsService } from "./collections.service"

const { infraCollections: ep } = endpoints

/**
 * Use infra controller for getting data, this is only for update/create/delete
 */

@SetSystemPermission("infra", "modify")
@Controller(ep.$base)
export class CollectionsController {
	constructor(private readonly service: CollectionsService) {}

	/**
	 * Create collection
	 */
	@Post(ep.create)
	async createOne(
		@DtoBody(CollectionCreateDto) body: CollectionCreateDto,
	): Promise<Data<CollectionMetadata>> {
		return wrap(this.service.createCollection(body))
	}

	/**
	 * Update
	 */
	@Put(ep.updateById)
	async updateById(
		@Param("id", ParseUUIDPipe) id: UUID,
		@DtoBody(CollectionUpdateDto) data: CollectionUpdateDto,
	): Promise<Data<CollectionMetadata>> {
		return wrap(this.service.updateCollection(id, data))
	}

	/**
	 * Delete
	 */
	@Delete(ep.deleteById)
	async deleteById(@Param("id", ParseUUIDPipe) id: UUID): Promise<Data<CollectionMetadata>> {
		return wrap(this.service.removeCollection(id))
	}
}
