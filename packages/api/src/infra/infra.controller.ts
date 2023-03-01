import { GetUser } from "@api/authentication/get-user.decorator"
import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { throw404 } from "@api/common/throw-http"
import { wrap } from "@api/common/wrap"
import { emsg } from "@api/errors"
import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common"
import {
	AuthUser,
	Data,
	endpoints,
	CollectionDef,
	FieldDef,
	RelationDef,
	type UUID,
} from "@zmaj-js/common"
import { UserInfraService } from "./user-infra.service"

const ep = endpoints.infraRead

@SetSystemPermission("infra", "read")
@Controller(ep.$base)
export class InfraController {
	constructor(private readonly service: UserInfraService) {}

	/**
	 * Get all allowed collections and fields
	 */
	@Get(ep.getCollections)
	async getCollections(@GetUser() user?: AuthUser): Promise<Data<CollectionDef[]>> {
		const collections = this.service.getInfra(user)
		return wrap(collections)
	}

	@Get(ep.getCollectionById)
	async getCollectionById(
		@Param("id", ParseUUIDPipe) id: UUID,
		@GetUser() user?: AuthUser,
	): Promise<Data<CollectionDef>> {
		const infra = this.service.getInfra(user)
		const col = infra.find((col) => col.id === id) ?? throw404(479234, emsg.noCollection)
		return wrap(col)
	}

	@Get(ep.getFieldById)
	async getFieldById(
		@Param("id", ParseUUIDPipe) id: UUID,
		@GetUser() user?: AuthUser,
	): Promise<Data<FieldDef>> {
		const infra = this.service.getInfra(user)
		const field =
			infra.flatMap((col) => Object.values(col.fields)).find((f) => f.id === id) ??
			throw404(904234, emsg.noField)
		return wrap(field)
	}

	@Get(ep.getRelationById)
	async getRelationById(
		@Param("id", ParseUUIDPipe) id: UUID,
		@GetUser() user?: AuthUser,
	): Promise<Data<RelationDef>> {
		const infra = this.service.getInfra(user)
		const rel =
			infra.flatMap((col) => Object.values(col.relations)).find((rel) => rel.id === id) ??
			throw404(39234, emsg.noRelation)
		return wrap(rel)
	}
}
