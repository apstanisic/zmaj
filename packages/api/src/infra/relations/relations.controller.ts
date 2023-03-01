import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { ParseFieldPipe } from "@api/common/parse-field.pipe"
import { wrap } from "@api/common/wrap"
import { Controller, Delete, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import {
	Data,
	endpoints,
	RelationDef,
	RelationCreateDto,
	RelationUpdateDto,
	type UUID,
} from "@zmaj-js/common"
import { RelationsService } from "./relations.service"

const { infraRelations: ep } = endpoints

@SetSystemPermission("infra", "modify")
@Controller(ep.$base)
export class RelationsController {
	constructor(
		private readonly service: RelationsService, //
	) {}

	/**
	 * Create Relation
	 */

	@Post(ep.create)
	async createRelation(
		@DtoBody(RelationCreateDto) body: RelationCreateDto,
	): Promise<Data<RelationDef>> {
		const created = await this.service.createRelation(body)
		return wrap(created)
	}

	/**
	 * Custom
	 */

	@Put(ep.updateById)
	async updateRelation(
		@Param("id", ParseUUIDPipe) id: UUID,
		@DtoBody(RelationUpdateDto) body: RelationUpdateDto,
	): Promise<Data<RelationDef>> {
		return wrap(this.service.updateRelation(id, body))
	}

	/**
	 * Custom
	 */

	@Delete(ep.deleteById)
	async deleteRelation(@Param("id", ParseUUIDPipe) id: UUID): Promise<Data<RelationDef>> {
		return wrap(this.service.deleteRelation(id))
	}

	// @Put(ep.splitM2M)
	// async splitManyToMany(@Param("id", ParseUUIDPipe) id: UUID): Promise<Data<RelationDef>> {
	// 	return wrap(this.service.splitManyToMany(id))
	// }

	// @Put(ep.joinM2M.endpoint)
	// async joinManyToMany(
	// 	@Param(ep.joinM2M.params.relation1Id, ParseUUIDPipe) id1: UUID,
	// 	@Param(ep.joinM2M.params.relation2Id, ParseUUIDPipe) id2: UUID,
	// ): Promise<Data<RelationDef>> {
	// 	return wrap(this.service.joinManyToMany(id1, id2))
	// }

	@Put(ep.joinManyToMany)
	async joinManyToMany(
		@Param("junctionCollection", ParseFieldPipe) collection: string,
	): Promise<Data<[RelationDef] | [RelationDef, RelationDef]>> {
		return wrap(this.service.joinManyToMany(collection))
	}

	@Put(ep.splitManyToMany)
	async splitManyToMany(
		@Param("junctionCollection", ParseFieldPipe) collection: string,
	): Promise<Data<[RelationDef] | [RelationDef, RelationDef]>> {
		return wrap(this.service.splitManyToMany(collection))
	}
}
