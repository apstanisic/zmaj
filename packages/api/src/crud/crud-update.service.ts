import { throw403, throw404, throw500 } from "@api/common/throw-http"
import type {
	CrudUpdateParams,
	UpdateAfterEvent,
	UpdateBeforeEvent,
	UpdateFinishEvent,
	UpdateStartEvent,
} from "@api/crud/crud-event.types"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { filterStruct, IdType, Struct } from "@zmaj-js/common"
import { isEmpty, isEqual, omit } from "radash"
import { Except } from "type-fest"
import { CrudBaseService } from "./crud-base.service"

@Injectable()
export class CrudUpdateService<Item extends Struct = Struct> extends CrudBaseService<Item> {
	/**
	 * Update item by ID
	 */
	async updateById(
		id: IdType,
		params: Except<CrudUpdateParams<Item>, "filter">,
	): Promise<Partial<Item>> {
		const updated = await this.updateWhere({ ...params, filter: { type: "id", id } })
		return updated.at(0) ?? throw404(7023674, emsg.notFound())
	}

	/**
	 * Many items
	 *
	 *
	 *
	 * DO LIKE THIS FOR TO MANY
	 * create trx on start
	 * do full update for direct, and then after 4th emit, with same trx, do other changes
	 */
	async updateWhere(params: CrudUpdateParams<Item>): Promise<Partial<Item>[]> {
		const trx = params.trx
		const collection = this.getCollection(params.collection)
		const repo = this.repoManager.getRepo(collection)

		// emit first hook
		const afterEmit1 = await this.emit<UpdateBeforeEvent<Item>>(
			{ ...params, trx, collection, action: "update", type: "before" }, //
		)

		// PK can't be changed, so pk property is deleted just in case
		// don't throw an error since it's easy to accidentally provide id with other data
		// afterEmit1.changes = this.removePk(collection, afterEmit1.changes)
		delete afterEmit1.changes[collection.pkField]

		// if no change is provided, throw
		// user can update only relations, so don't throw here, simply return item that should
		// have been updated
		// if (isEmpty(afterEmit1.changes)) throw400(75419)

		// all fields must be allowed to change. We don't want to silently change only partially
		// this does not check condition. Only that field can be modified, because we still don't have
		// content of the record
		this.authz.canModifyResource({
			resource: afterEmit1.collection,
			action: "update",
			user: afterEmit1.user,
			changes: afterEmit1.changes,
		}) || throw403(987632, emsg.noAuthz)

		// TRANSACTION -----------------------------------------
		const afterEmit3 = await this.executeTransaction(trx, async (trx) => {
			// join filter from query, with filter from authorization
			const where = this.joinFilterAndAuthz(afterEmit1)
			// rows that fullfil that filter
			const foundRows = await repo.findWhere({ where: where as any, trx })

			// if ids are provided, and user can't delete all ids, throw
			if (afterEmit1.filter.type === "ids" && afterEmit1.filter.ids.length !== foundRows.length) {
				throw403(58829, emsg.noAuthz)
			}
			// if (afterEmit1.filter.type === "id" && foundRows.length === 0) {
			//   //
			// }

			const toUpdate: UpdateStartEvent<Item>["toUpdate"] = foundRows.map((item) => ({
				id: (item[collection.pkField as keyof Item] ?? throw500(23486)) as unknown as IdType,
				original: item,
				changed: omit({ ...structuredClone(item), ...afterEmit1.changes }, [
					collection.pkField,
				]) as Partial<Item>,
			}))

			// emit second hook
			const afterEmit2 = await this.emit<UpdateStartEvent<Item>>(
				{ ...afterEmit1, trx, type: "start", toUpdate }, //
			)

			// since we need to pass changes, we have to update every record differently
			// so we just pluck changes from them.
			// we can't directly pass changes since we need to provide hook in afterEmit2
			const updated = await Promise.all(
				afterEmit2.toUpdate.map((item) => {
					const changes = filterStruct(
						item.changed,
						// only values that are not same as before
						(value, key) =>
							key === collection.pkField ||
							(!isEqual(value, item.original[key]) && value !== undefined),
					)

					// simply return item if there are no changes
					if (isEmpty(changes)) return repo.findById({ trx, id: item.id })

					return repo.updateById({ trx, changes, id: item.id })
				}),
			)

			// emit 3rd hook
			const afterEmit3 = await this.emit<UpdateFinishEvent<Item>>(
				{ ...afterEmit2, trx, type: "finish", result: updated }, //
			)
			return this.omitTrx(afterEmit3)
		})

		// emit 4th hook
		const afterEmit4 = await this.emit<UpdateAfterEvent<Item>>({
			...afterEmit3,
			type: "after",
			trx,
		})

		// return data and meta
		return this.getAllowedData(afterEmit4) as Item[]
	}

	// async handleToMany(em: EntityManager, afterEmit4: UpdateAfterEvent): Promise<void> {
	//   // get properties that are o2m or m2m relation
	//   // we don't want to provide those values to update
	//   const toManyRelations = afterEmit4.collection.fullRelations.filter(
	//     (r) => r.type === "one-to-many" || r.type === "many-to-many",
	//   )

	//   // we have hook that enables us to change only some records without throwing an exception
	//   // in those case we log forbidden as logs
	//   // TODO currently all records are joined to same array for property
	//   const warnings: Struct<IdType[]> = {}
	//   // update x2m relations
	//   // We check every x2m property to see if there is provided value
	//   // if not, we simply don't do nothing
	//   for (const relation of toManyRelations) {
	//     // get changes for relation
	//     const relProperty = afterEmit4.changes[relation.propertyName]
	//     // do nothing if value is invalid
	//     const toManyChanges = ChangeToManySchema.optional().parse(relProperty)
	//     if (!toManyChanges) continue

	//     // we want to check permissions on row before update since it might change permissions
	//     for (const updatedRow of afterEmit4.result) {
	//       const id = updatedRow[afterEmit4.collection.pkField] ?? throw500(6482376)
	//       if (relation.type === "one-to-many") {
	//         await this.updateWhere({
	//           em,
	//           req: afterEmit4.req,
	//           user: afterEmit4.user,
	//           collection: relation.rightTable,
	//           filter: { type: "ids", ids: toManyChanges.added },
	//           changes: { [relation.rightField]: id },
	//         })

	//         await this.updateWhere({
	//           em,
	//           req: afterEmit4.req,
	//           user: afterEmit4.user,
	//           collection: relation.rightTable,
	//           filter: { type: "ids", ids: toManyChanges.removed },
	//           changes: { [relation.rightField]: null } as any,
	//         })
	//       } else if (relation.type === "many-to-many") {
	//         await this.del.deleteWhere({
	//           em,
	//           user: afterEmit4.user,
	//           req: afterEmit4.req,
	//           collection: relation.junctionTable,
	//           filter: {
	//             type: "where",
	//             where: {
	//               [relation.junctionLeftField]: id,
	//               [relation.junctionRightField]: { $in: toManyChanges.removed },
	//             },
	//           },
	//         })

	//         await this.create.createMany({
	//           em,
	//           user: afterEmit4.user,
	//           req: afterEmit4.req,
	//           collection: relation.junctionTable,
	//           dto: toManyChanges.added.map((addedId) => ({
	//             [relation.junctionLeftField]: id,
	//             [relation.junctionRightField]: addedId,
	//           })),
	//         })
	//       }
	//     }
	//   }
	// }
}
