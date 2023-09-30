import { Fields, Filter, ResponseWithCount } from "@api/common"
import { throw400, throw403, throw404, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	CollectionDef,
	FieldDef,
	Struct,
	UrlQuerySchema,
	isStruct,
	pageToOffset,
	zodCreate,
} from "@zmaj-js/common"
import { BaseModel, FindManyOptions, GetReadFields, IdType } from "@zmaj-js/orm"
import { isEmpty, isString } from "radash"
import { Except, PartialDeep } from "type-fest"
import { v4 } from "uuid"
import { CrudBaseService } from "./crud-base.service"
import type {
	CrudReadParams,
	ReadAfterEvent,
	ReadBeforeEvent,
	ReadFinishEvent,
	ReadStartEvent,
} from "./crud-event.types"

@Injectable()
export class CrudReadService<Item extends Struct = Struct> extends CrudBaseService<Item> {
	/**
	 * Read item by ID
	 */
	async findById(
		id: IdType,
		params: Except<CrudReadParams<Item>, "filter">,
	): Promise<PartialDeep<Item>> {
		params.options ??= {}
		params.options.limit = 1
		const response = await this.findWhere({ ...params, filter: { type: "id", id } })
		return response.data.at(0) ?? throw404(967324, emsg.notFound())
	}

	async findWhere(params: CrudReadParams<Item>): Promise<ResponseWithCount<Item>> {
		const collection = this.getCollection(params.collection)
		const repo = this.repoManager.getRepo(collection.collectionName)
		const options = zodCreate(UrlQuerySchema, params.options ?? {})

		const afterEmit1 = await this.emit<ReadBeforeEvent<Item>>(
			{ ...params, options, collection, action: "read", type: "before" }, //
		)

		this.checkCrudPermission(afterEmit1)

		this.checkIfJoinsAllowed(afterEmit1.options.fields, collection)

		const afterEmit3 = await this.executeTransaction(params.trx, async (em) => {
			const where = this.parseFilter(afterEmit1) as Struct

			const afterEmit2 = await this.emit<ReadStartEvent<Item>>(
				{ ...afterEmit1, trx: em, filter: { type: "where", where }, type: "start" }, //
			)

			const { page, sort, count, fields } = afterEmit2.options
			const filter = afterEmit2.filter
			const limit = afterEmit2.options.limit ?? 20
			if (!isEmpty(sort)) {
				const allowed = this.authz.check({
					action: "read",
					resource: afterEmit2.collection,
					user: afterEmit2.user,
					field: Object.keys(sort),
				})

				if (!allowed) throw403(499321, emsg.invalidQueryKey("sort"))

				const invalidSort = Object.keys(sort).find(
					(field) => collection.fields[field]?.sortable !== true,
				)
				if (invalidSort) throw400(7756711, emsg.invalidSort(invalidSort))
			}

			const queryParams: FindManyOptions<BaseModel, any, false> = {
				trx: em,
				limit,
				fields,
				offset: pageToOffset(page ?? 1, limit),
				orderBy: sort,
				where:
					filter.type === "id"
						? [filter.id]
						: filter.type === "ids"
						? filter.ids
						: filter.where,
			}

			let items: GetReadFields<BaseModel, false>[]
			let counted: number | undefined

			// Only count if requested. This is needed because react-admin required it
			if (count) {
				;[items, counted] = await repo.findAndCount(queryParams as any)
			} else {
				items = await repo.findWhere(queryParams as any)
			}

			const afterEmit3 = await this.emit<ReadFinishEvent<Item>>(
				{ ...afterEmit2, result: items as Item[], count: counted, type: "finish" }, //
			)
			return this.omitTrx(afterEmit3)
		})

		const afterEmit4 = await this.emit<ReadAfterEvent<Item>>({
			...afterEmit3,
			trx: params.trx,
			type: "after",
		})

		const allowedItems = this.getAllowedData(afterEmit4)

		return { count: afterEmit4.count, data: allowedItems as PartialDeep<Item>[] }
	}

	/**
	 * Get string fields for universal filter
	 *
	 * @param collection Collection that is queried
	 * @returns field that are string type
	 */
	private getQuickFilterFields(collection: CollectionDef): FieldDef[] {
		return Object.values(collection.fields).filter((f) => f.dataType === "text")
	}

	/**
	 * We have 3 possible config values for join.
	 * - all - Everything can be joined, m2o, o2m, m2m
	 * (not recommended, since we can't limit right side, and you could download thousands of records)
	 * - to-one - Only allow join if right side is one side (object, not array)
	 * - none - No join is allowed (recommended - smallest chance for abuse from users)
	 */
	private checkIfJoinsAllowed(
		fields: Fields<unknown> | undefined,
		collection: CollectionDef,
	): void {
		fields ??= {}
		const allowedJoin = this.crudConfig.allowedJoin
		if (allowedJoin === "all") return

		for (const field of Object.keys(fields)) {
			const isField = collection.fields[field]
			if (isField) continue
			const relation =
				collection.relations[field] ?? throw400(34279234, emsg.invalidPayloadKey(field))

			// if any join is forbidden, throw
			if (allowedJoin === "none") throw403(7926561, emsg.invalidPayload)

			// if it's o2m or m2m throw
			if (relation.type === "many-to-many" || relation.type === "one-to-many") {
				throw403(296523, emsg.invalidPayload)
			}

			const fieldValue = fields[field as keyof typeof fields]

			// if it's m2o or o2o, and user specified subfields,
			// we have to check every field for nested relation
			if (isStruct(fieldValue)) {
				const rightSide =
					this.infraState.getCollection(relation.otherSide.collectionName) ??
					throw500(97234)
				this.checkIfJoinsAllowed(fieldValue, rightSide)
			}
		}
	}

	/**
	 * Parse filter
	 *
	 * @param event Data that is returned after first emitter
	 * @returns object that can be passed to orm `where` property
	 */
	private parseFilter(event: ReadBeforeEvent<Item>): Filter {
		const superFilter = event.options.filter["$q"]

		// string check is for ts
		// if no super filter, use normal filter, or ids
		if (!isString(superFilter) || isEmpty(superFilter)) {
			return this.joinFilterAndAuthz(event)
		}

		// if provided `superFilter`, we get all possible columns and SQL `LIKE` them
		// This is little ugly, but if there is no string fields, there won't be any condition
		// so we say we want pk to have -1 value if auto-increment and random uuid if uuid.
		// this ensures that no data will be fetched
		const stringFields = this.getQuickFilterFields(event.collection) //
			// this allows superFilter only on columns that user can read
			.filter((f) =>
				this.authz.check({
					user: event.user,
					action: event.action,
					resource: event.collection,
					field: f.fieldName,
				}),
			)

		// if there is no string fields. Return comparison that always returns false
		// there is maybe better way, I'm not sure, since we must pass proper field to mikro orm
		if (stringFields.length === 0) {
			const alwaysFalseComparison = event.collection.pkType === "auto-increment" ? -1 : v4()
			return { [event.collection.pkField]: alwaysFalseComparison }
		}

		return {
			$or: stringFields.map((field) => ({
				[field.fieldName as keyof Item]: { $like: `%${superFilter}%` },
			})),
		}
	}
}
