import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw400, throw403, throw404, throw500 } from "@api/common/throw-http"
import { Filter } from "@api/common/types"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { ForbiddenException, HttpException, Injectable, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { CollectionDef, Struct, isError, isIdType, isNil, isStruct, notNil } from "@zmaj-js/common"
import { RepoManager, Transaction } from "@zmaj-js/orm"
import { isEmpty, omit } from "radash"
import { PartialDeep } from "type-fest"
import {
	CrudAfterEvent,
	CrudBeforeEvent,
	CrudFinishEvent,
	CrudStartEvent,
	ReadBeforeEvent,
} from "./crud-event.types"
import { CrudConfig } from "./crud.config"
import { GetEmitKeyParams, getCrudEmitKey } from "./get-crud-emit-key"

/**
 * Base CRUD service that provides basic functionality to extending services
 */
@Injectable()
export class CrudBaseService<Item extends Struct> {
	/**
	 * Logger
	 */
	protected logger = new Logger("CrudService")

	/**
	 *
	 * @param authz For authorization
	 * @param emitter For emitting crud events
	 * @param infraState For getting relations
	 * @param repoManager For DB
	 * @param updateToMany
	 * @param config
	 */
	constructor(
		protected readonly authz: AuthorizationService,
		private readonly emitter: EventEmitter2,
		protected readonly infraState: InfraStateService,
		protected readonly repoManager: RepoManager,
		protected readonly crudConfig: CrudConfig,
	) {}

	/**
	 * Execute function with provided transaction, or create new transaction
	 *
	 * If no transaction is provided it will commit transaction, otherwise, user can continue
	 * using provided transaction
	 *
	 * @param fn Get core function (part that is in transaction)
	 * @param trx EM that is provided to method (can be undefined)
	 * @returns result of `fn`
	 */
	protected async executeTransaction<T>(
		trx: Transaction | undefined,
		fn: (em: Transaction) => Promise<T>,
	): Promise<T> {
		return trx
			? fn(trx).catch((e) => this.throwCrudError(e))
			: this.repoManager.transaction({ fn }).catch((e) => this.throwCrudError(e))
	}

	/**
	 * Omit transaction from "finish" event
	 *
	 * @param event Third event (finish, last event in transaction)
	 * @returns All data except transaction
	 */
	protected omitTrx<T extends CrudFinishEvent<Item>>(event: T): Omit<T, "trx"> {
		const { trx, ...rest } = event
		return rest
	}

	/**
	 * Since we are working with db. This is helper to catch some errors from db
	 *
	 * @todo Improve this to support more common errors
	 * @todo Check if there is library that handles differences between database errors
	 * @param error Error object
	 * @throws Provided error
	 */
	private throwCrudError(error: unknown): never {
		// if it's already http error, just rethrow
		if (error instanceof HttpException) throw error
		// not error
		if (!isError(error)) throw500(9067123)

		// provided non uuid for uuid field
		const isUuidError = error.message
			.toLowerCase()
			.includes("invalid input syntax for type uuid")
		if (isUuidError) throw400(153211, emsg.notUuid)

		// User is trying to filter by unknown property
		const isUnknownFieldError = error.message.toLowerCase().endsWith("does not exist")
		if (isUnknownFieldError) console.log(error)

		if (isUnknownFieldError) throw400(901732, emsg.noProperty)

		this.logger.warn("Crud Problem", error)

		console.log({ error })

		// this.logger.error("Unhandled DB error", error)
		// any other error from db
		throw400(723810, emsg.invalidQuery)
	}

	/**
	 * Join filter from request with conditions in permissions
	 *
	 * @param event Data return from first emitted event
	 * @returns Combined conditions
	 */
	protected joinFilterAndAuthz(event: CrudBeforeEvent<Item>): { $and: Filter[] } {
		// there is no filter on create
		if (event.action === "create") throw500(328462343)

		const authzFilter = this.authz.getAuthzAsOrmFilter({
			user: event.user,
			resource: event.collection,
			action: event.action,
		})

		// check that every user filter is allowed
		if (event.filter.type === "where") {
			this.isFilterAllowed({
				action: event.action,
				collection: event.collection,
				filter: event.filter.where,
				user: event.user,
			})
		}
		const queryFilter = this.filterToWhere(event.filter, event.collection)

		return {
			$and: [queryFilter, ...authzFilter.$and]
				.filter(notNil)
				.filter((v): v is Filter => !isEmpty(v)),
		}
	}

	protected getAllowedData(event: CrudAfterEvent<Item>): PartialDeep<Item>[] {
		return event.result.map((row) => {
			// ID is always returned
			const pkField = event.collection.pkField
			const id = row[pkField]
			if (!isIdType(id)) throw500(51823)

			const allowed = this.authz.pickAllowedData({
				user: event.user,
				// resource: event.authz?.resource ?? event.collection,
				resource: event.collection,
				record: row,
				fields: event.action === "read" ? event.options.fields : undefined, // event.req?.query.fields,
			})

			// always return pk
			return { ...allowed, [pkField]: id } as PartialDeep<Item>
		})
	}
	/**
	 * Get collection for current crud operation
	 *
	 * It accepts undefined because we can't guarantee it in request, and we don't want to handle
	 * same error every time
	 * @throws if table is undefined
	 * @throws if collection does not exist
	 * @returns Relevant collection
	 */
	protected getCollection(tableOrCollection?: string | CollectionDef): CollectionDef {
		if (tableOrCollection === undefined) throw500(96233562)
		if (typeof tableOrCollection !== "string") return tableOrCollection

		const col =
			this.infraState.getCollection(tableOrCollection) ?? throw404(97767, emsg.recordNotFound)
		// don't allow disabled ext
		if (col.disabled) throw404(73829, emsg.recordNotFound)
		return col as CollectionDef
	}

	/**
	 * Emit CRUD event
	 *
	 * @param params
	 * @returns Provided data with changes
	 */
	protected async emit<T extends GetEmitKeyParams<Item>>(params: T): Promise<T> {
		// shallow clone
		const cloned = { ...params }

		const emitKey = getCrudEmitKey(params)
		if (!this.emitter.hasListeners(emitKey)) return cloned

		// do not emit if system table (for now, maybe in future)
		const table = this.getCollection(params.collection).tableName

		const allowedTables = [
			"zmaj_files",
			"zmaj_users",
			"zmaj_roles",
			"zmaj_permissions",
			"zmaj_webhooks",
		]
		// if it's system table, and not one of whitelisted, do nothing
		if (table.startsWith("zmaj") && !allowedTables.includes(table)) return cloned

		// if (col.tableName.startsWith("zmaj")) cloned

		await this.emitter.emitAsync(emitKey, cloned)
		return cloned
	}

	protected filterToWhere(filter: ReadBeforeEvent<Item>["filter"], col: CollectionDef): Struct {
		if (filter.type === "ids" && isEmpty(filter.ids)) throw400(3689292, emsg.invalidPayload)
		if (filter.type === "id" && !isIdType(filter.id)) throw400(965323, emsg.invalidPayload)

		if (filter.type === "id") {
			return { [col.pkField]: filter.id }
		} else if (filter.type === "ids") {
			return { [col.pkField]: { $in: filter.ids } }
		} else {
			// check if user can read fields, otherwise forbid filter
			return filter.where
		}
	}

	/**
	 *
	 * @param event
	 */
	protected checkCrudPermission(event: CrudBeforeEvent<Item>): void | never {
		const allowed = this.authz.check({
			action: event.action, //
			resource: event.collection,
			user: event.user,
		})

		if (!allowed) throw new ForbiddenException("8777")
	}

	/**
	 * IDK do I need this
	 */
	protected removePk<T>(collection: CollectionDef, obj: Struct): Partial<T> {
		const pk = collection.pkField
		// this shallow clones object, and removed pk
		const data = omit(obj, [pk])
		return data as Partial<T>
	}

	/**
	 * Is user filter allowed
	 *
	 * If user can read `posts ["id", "title"]`, and can't read `["body", "userId"]`
	 * then filter `{ userId: "some-id" }` should be forbidden, since user can infer that value
	 * based on returned data
	 */
	protected isFilterAllowed(
		params: Pick<CrudStartEvent, "user" | "action" | "collection"> & { filter: unknown },
	): void {
		const filter = params.filter
		if (isNil(filter) || isEmpty(filter)) return
		if (!isStruct(filter)) throw400(532432, emsg.invalidPayload)

		const collection = params.collection

		if ("$or" in filter || "$and" in filter) {
			// $or & $and must be alone
			if (Object.keys(filter).length > 1) throw400(50812, emsg.invalidPayload)
			const value = filter["$and"] || filter["$or"]

			if (!Array.isArray(value)) throw400(50888, emsg.invalidPayload)

			// check every sub filter in them
			// value.forEach((val) => this.isWhereAllowed(val, fields, collection))
			value.forEach((val) => this.isFilterAllowed({ ...params, filter: val }))
			return
		}

		const fieldsToCheck = []
		const relationsToCheck = []
		for (const key of Object.keys(filter)) {
			if (collection.fields[key]) {
				fieldsToCheck.push(key)
			} else if (collection.relations[key]) {
				relationsToCheck.push(key)
			} else {
				console.log({ key, filter })

				throw403(50852, emsg.invalidQueryKey("filter"))
			}
		}
		const fieldsAllowed = this.authz.check({
			action: params.action,
			resource: params.collection.authzKey,
			field: fieldsToCheck,
			user: params.user,
		})
		if (!fieldsAllowed) throw403(399443, emsg.noField)

		for (const relation of relationsToCheck) {
			const rel = collection.relations[relation]!
			const rightCol =
				this.infraState.collections[rel.otherSide.collectionName] ??
				throw400(899022, emsg.invalidPayload)
			this.isFilterAllowed({
				action: params.action,
				user: params.user,
				collection: rightCol,
				filter: filter[relation],
			})
		}
	}
}
