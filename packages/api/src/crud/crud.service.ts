import { AuthorizationService } from "@api/authorization/authorization.service"
import { ResponseWithCount } from "@api/common"
import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { throw400, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { Struct, UrlQuerySchema } from "@zmaj-js/common"
import { isArray } from "radash"
import { PartialDeep } from "type-fest"
import { CrudDeleteService } from "./crud-delete.service"
import { CrudCreateParams, CrudUpdateParams } from "./crud-event.types"
import { CrudReadService } from "./crud-read.service"
import { CrudWithRelationsService } from "./crud-with-relations.service"

/**
 * Use crud services when working with end user data,
 * db when you need direct access to database,
 * and orm for internal usage with data that is not sent to user.
 */
@Injectable()
export class CrudService<Item extends Struct = Struct> {
	constructor(
		protected authz: AuthorizationService,
		private read: CrudReadService<Item>,
		private del: CrudDeleteService<Item>,
		private crudWithRel: CrudWithRelationsService<Item>,
	) {}

	/**
	 * Find by ID
	 */
	async findById(req: CrudRequest): Promise<PartialDeep<Item>> {
		return this.read.findById(req.recordId ?? throw400(387923, emsg.noId), {
			collection: req.collection ?? throw500(3923),
			options: UrlQuerySchema.parse(req.query),
			req,
			// authz: req.authz,
			user: req.user,
		})
	}

	/**
	 * Find many
	 */
	async findMany(req: CrudRequest): Promise<ResponseWithCount<Item>> {
		const query = UrlQuerySchema.parse(req.query)
		return this.read.findWhere({
			req,
			collection: req.collection ?? throw500(5239874),
			options: query,
			filter: { type: "where", where: query.filter },
			user: req.user,
			// authz: req.authz,
		})
	}

	/**
	 * Create one
	 */
	async createOne(
		req: CrudRequest,
		options?: Partial<CrudCreateParams<Item>>,
	): Promise<Partial<Item>> {
		let dto = isArray(options?.dto) ? options?.dto.at(0) : options?.dto
		dto = dto ?? req.body

		return this.crudWithRel.createOne(dto, {
			collection: req.collection ?? throw500(34298),
			req,
			user: req.user,
			...options,
		})
	}

	/**
	 * Update by ID
	 */
	async updateById(req: CrudRequest, replace?: Partial<CrudUpdateParams<Item>>): Promise<Item> {
		return this.crudWithRel.updateById(req.recordId ?? throw500(9038427), {
			req,
			collection: req.collection ?? throw500(47892934),
			changes: req.body,
			// authz: req.authz,
			user: req.user,
			...replace,
		})
	}

	/**
	 * Delete by ID
	 */
	async deleteById(req: CrudRequest): Promise<Partial<Item>> {
		return this.del.deleteById(
			req.recordId ?? throw500(3428642), //
			{
				req,
				collection: req.collection ?? throw500(8632234),
				user: req.user,
			},
		)
	}
}
