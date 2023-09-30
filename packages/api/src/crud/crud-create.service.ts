import { throw400, throw403, throw500 } from "@api/common/throw-http"
import type {
	CreateAfterEvent,
	CreateBeforeEvent,
	CreateFinishEvent,
	CreateStartEvent,
	CrudCreateParams,
} from "@api/crud/crud-event.types"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { Struct, castArray } from "@zmaj-js/common"
import { isEmpty, omit } from "radash"
import { Except } from "type-fest"
import { CrudBaseService } from "./crud-base.service"

/**
 * Response is partial item/s that can be null.
 * They are null in case where user can create but can't read them
 * @todo swap event names
 */
@Injectable()
export class CrudCreateService<Item extends Struct = Struct> extends CrudBaseService<Item> {
	/**
	 * Create one is the same as create many, except that it only accepts one item.
	 * Because of this, we can simply pass data to `createMany`
	 */
	async createOne(
		dto: Struct,
		params: Except<CrudCreateParams<Item>, "dto">,
	): Promise<Partial<Item>> {
		const created = await this.createMany({ ...params, dto: [dto] })
		// await this.createMany({ collection: "posts", dto: { hello: "world" } } })
		return created.at(0) ?? throw500(7023678)
	}

	/**
	 * Create many items
	 */
	async createMany(params: CrudCreateParams<Item>): Promise<Partial<Item>[]> {
		const collection = this.getCollection(params.collection)
		const repo = this.repoManager.getRepo(collection.collectionName)

		// If table only has Primary key, don't allow creating items
		// Common error when user tests after creating table
		// I don't know if 400 should be used, or something other
		if (Object.keys(collection.fields).length < 2) throw400(9274, emsg.tableHasOnlyPk)

		const dto = castArray<Struct>(structuredClone(params.dto)).map((v) =>
			omit(v, [collection.pkField]),
		)

		if (dto.length < 1) throw400(382033, emsg.emptyPayload)

		const afterEmit1 = await this.emit<CreateBeforeEvent<Item>>(
			{ ...params, collection, dto, action: "create", type: "before" }, //
		)
		// check every item
		for (const item of afterEmit1.dto) {
			// throw if empty object is provided
			if (isEmpty(item)) throw400(187973, emsg.emptyPayload)

			// All data that user provided must be allowed
			const allowed = this.authz.canModifyResource({
				user: afterEmit1.user,
				resource: afterEmit1.collection,
				action: "create",
				changes: item,
			})
			if (!allowed) throw403(86328992, emsg.noAuthz)
		}

		// User can provide factory function that creates item (useful for internal col: newUser, newRole...)
		// since factory is running  trusted code, we don't have to delete id
		// Factory is run after returning allowed fields, because it might set id, or something similar
		const factory = params.factory
		if (factory) {
			afterEmit1.dto = await Promise.all(
				afterEmit1.dto.map(async (item) =>
					typeof factory === "function" ? factory(item) : factory.parse(item),
				),
			)
		}

		// TRX
		const afterEmit3 = await this.executeTransaction(params.trx, async (em) => {
			const afterEmit2 = await this.emit<CreateStartEvent<Item>>(
				{ ...afterEmit1, trx: em, type: "start" }, //
			)

			const createdRecords = await repo.createMany({
				trx: em,
				data: afterEmit2.dto as any[],
				overrideCanCreate: params.overrideCanCreate,
			})

			const afterEmit3 = await this.emit<CreateFinishEvent<Item>>(
				{ ...afterEmit2, result: createdRecords as Item[], type: "finish" }, //
			)

			return this.omitTrx(afterEmit3)
		})
		//

		const afterEmit4 = await this.emit<CreateAfterEvent<Item>>(
			{ ...afterEmit3, trx: params.trx, type: "after" }, //
		)

		return this.getAllowedData(afterEmit4) as Partial<Item>[]
	}
}
