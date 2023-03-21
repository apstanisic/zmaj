import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { wrap } from "@api/common/wrap"
import { Controller, Delete, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import {
	Data,
	endpoints,
	FieldMetadata,
	FieldCreateDto,
	FieldUpdateDto,
	type UUID,
} from "@zmaj-js/common"
import { FieldsService } from "./fields.service"

const { infraFields: ep } = endpoints
/**
 * Use Infra controller for getting data, this is only for create/update/delete
 */
@SetSystemPermission("infra", "modify")
@Controller(ep.$base)
export class FieldsController {
	constructor(private readonly service: FieldsService) {}

	/**
	 * There is event hook that will create column in database
	 */
	@Post(ep.create)
	async createOne(@DtoBody(FieldCreateDto) dto: FieldCreateDto): Promise<Data<FieldMetadata>> {
		return wrap(this.service.createField(dto))
	}

	@Put(ep.updateById)
	async updateById(
		@Param("id", ParseUUIDPipe) id: UUID,
		@DtoBody(FieldUpdateDto) dto: FieldUpdateDto,
	): Promise<Data<FieldMetadata>> {
		return wrap(this.service.updateField(id, dto))
	}

	@Delete(ep.deleteById)
	async deleteById(@Param("id", ParseUUIDPipe) id: UUID): Promise<Data<FieldMetadata>> {
		return wrap(this.service.deleteField(id))
	}
}
