import { GlobalConfig } from "@api/app/global-app.config"
import { throw400, throw403 } from "@api/common/throw-http"
import { knexQuery } from "@api/database/knex-query"
import { emsg } from "@api/errors"
import { Inject, Injectable } from "@nestjs/common"
import { Struct, isNil, joinFilters } from "@zmaj-js/common"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { isEmpty } from "radash"
import { CrudBaseService } from "./crud-base.service"
import type { ReadBeforeEvent, ReadStartEvent } from "./crud-event.types"
import { OnCrudEvent } from "./on-crud-event.decorator"

@Injectable()
export class CrudReadJoinService<Item extends Struct = Struct> extends CrudBaseService<Item> {
	@Inject(GlobalConfig)
	private globalConfig!: GlobalConfig

	/**
	 * Is gui integration enabled
	 */
	get enabled(): boolean {
		return this.globalConfig.enableAdminPanelIntegration
	}

	/**
	 * Check if user is allowed to update fk value in o2m relation
	 *
	 * If user is not allowed to update this field, there is no point in providing relevant records
	 * Example: post => comments.post_id
	 * We are on the post page, and want to update comments property
	 * Since comments is not property on posts, we need to check comments table.
	 * This method checks if user is allowed to update `comments.post_id`. If it's not allowed,
	 * it will throw
	 * This method is called when fetching relevant "many" rows in o2m relation
	 * @param event CRUD Event
	 */
	@OnCrudEvent({ action: "read", type: "before" })
	__checkIfUserCanUpdateCollection(event: ReadBeforeEvent): void {
		if (!this.enabled) return
		// const field = event.req.query.referenceField
		const field = event.options.otmFkField

		if (!field) return

		const canEditFk = this.authz.check({
			user: event.user,
			action: "update",
			field,
			resource: event.collection,
		})
		if (!canEditFk) throw403(96213, emsg.noAuthz)
	}

	/**
	 * used for o2m and m2m
	 * Filter choices for o2m relations to only those that user can change
	 *
	 * This hijacks normal query for the right side of relation in o2m (when fetching choices)
	 * It detects it with `referenceField`. That is a signal that this is o2m relation
	 * and that user is fetching choices for the right side. If user sets `referenceShowForbidden`
	 * to true that means that they want both allowed and forbidden to update choices
	 * Otherwise we will join standard query filter (from url) with conditions that are needed to
	 * update row. There is no need to do anything for read permissions since main method already does that
	 *
	 *
	 * Join current filter with conditions that user needs to fulfil to update record.
	 * We already checked above if user can update field. Now we need to get conditions under which
	 * user is available to update record.
	 * And we will join that conditions with current filter.
	 *
	 * @param event
	 * @returns
	 */
	@OnCrudEvent({ action: "read", type: "start" })
	__getOnlyEntitiesThatUserCanUpdate(event: ReadStartEvent<Item>): void {
		if (!this.enabled) return
		const query = event.options
		// Only activate if reference field is provided
		if (!query.otmFkField) return
		// If user wants to be shown records that can't be updated, we don't need to do anything here
		// `read` conditions are already applied
		// if (query.referenceShowForbidden) return
		if (query.otmShowForbidden) return

		// get conditions to update record
		const updateConditions = this.authz.getAuthzAsOrmFilter({
			action: "update",
			resource: event.collection,
			user: event.user,
		})

		// do nothing if conditions is it's empty object
		if (isEmpty(updateConditions)) return

		const where = this.filterToWhere(event.filter, event.collection)

		event.filter = {
			type: "where",
			where: joinFilters(where, ...updateConditions.$and) ?? {},
		}
	}

	/**
	 * We need to make subquery when fetching right side of m2m for options, since we only want data that does not
	 * already have owner
	 * This must be done with one query and subquery, since otherwise we would have to fetch all rows
	 * that are currently owned. This way db engine can optimize query.
	 * We are using knex to generate subquery, since it's the simplest solution .
	 * Knex will return raw sql query with escaped values. And we will simply pass that to orm,
	 * and will check that main query does not contain id property in returned subquery array
	 *
	 * @example Generated query
	 * ```sql
	 * select * from "tags"
	 * where "id" not in
	 *   (select "tag_id"
	 *    from "posts_tags"
	 *    where "post_id" = ?)
	 * limit ?
	 * offset ?
	 * ```
	 *
	 * @todo Maybe implement filter and count.
	 */
	@OnCrudEvent({ type: "start", action: "read" })
	async __generateManyToManyFilter(event: ReadStartEvent<Item>): Promise<void> {
		if (!this.enabled) return
		const leftCollection = event.options.mtmCollection
		const leftProperty = event.options.mtmProperty
		const leftRecordId = event.options.mtmRecordId

		if (isNil(leftCollection) || isNil(leftProperty) || isNil(leftRecordId)) return
		// // If collection and property are provided, but record id is not, that means it's create
		// // action, and we can simply return all records from right table
		// if (!leftRecordId) return

		const relation =
			this.infraState.getCollection(leftCollection)?.relations[leftProperty] ??
			throw400(820523, emsg.invalidPayloadKey(leftProperty))

		if (relation.type !== "many-to-many") {
			throw400(669293, emsg.invalidPayloadKey(leftProperty))
		}

		// I do not know if this is the best way
		// check if we can update junction table
		const allowedToUpdate = this.authz.check({
			user: event.user,
			action: "modify", // must be able to add, remove, and change records
			resource: `collections.${relation.junction.collectionName}`,
		})
		if (!allowedToUpdate) throw403(962131, emsg.noAuthz)

		// Example:
		// // posts - posts_tags - tags
		// get all rows belonging to left side
		const recordsThatAreOwnedByProvidedId = knexQuery
			.from(relation.junction.tableName)
			.where(relation.junction.thisSide.columnName, leftRecordId)
			.select(relation.junction.otherSide.columnName)
			.toQuery()

		// We want all records that are not in array of already existing records
		// this is tied to MikroORM
		// we need to cast value since we use orm agnostic em type
		const orm = (this.orm.engine.engineProvider as SequelizeService).orm
		const subqueryFilter = {
			// id: { $nin: mikroOrmEm.raw(recordsThatAreOwnedByProvidedId) },
			// cloneDeep properly clones orm.literal, which is instance of class,
			// so it's safe that user can't provide literal value
			id: { $nin: orm.literal("(" + recordsThatAreOwnedByProvidedId + ")") },
		}
		// If there is $and filter, just push as another,
		// otherwise, create new $and

		const currentFilter = this.filterToWhere(event.filter, event.collection)

		event.filter = {
			type: "where",
			where: joinFilters(currentFilter, subqueryFilter) ?? {},
		}
	}
}
