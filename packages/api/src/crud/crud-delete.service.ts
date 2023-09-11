import { throw403, throw404, throw500 } from "@api/common/throw-http"
import { Filter } from "@api/common/types"
import type {
	CrudDeleteParams,
	DeleteAfterEvent,
	DeleteBeforeEvent,
	DeleteFinishEvent,
	DeleteStartEvent,
} from "@api/crud/crud-event.types"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { Struct } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"
import { Except, ReadonlyDeep } from "type-fest"
import { CrudBaseService } from "./crud-base.service"

@Injectable()
export class CrudDeleteService<Item extends Struct = Struct> extends CrudBaseService<Item> {
	/**
	 * Delete item by ID
	 */
	async deleteById(
		id: IdType,
		params: Except<CrudDeleteParams<Item>, "filter">,
	): Promise<Partial<Item>> {
		const deleted = await this.deleteWhere({ ...params, filter: { type: "id", id } })
		return deleted.at(0) ?? throw404(9472342, emsg.recordNotFound)
	}

	async deleteWhere(params: CrudDeleteParams<Item>): Promise<Partial<Item>[]> {
		const { trx } = params
		const collection = this.getCollection(params.collection)
		const repo = this.repoManager.getRepo(collection.collectionName)

		const afterEmit1 = await this.emit<DeleteBeforeEvent<Item>>(
			{ ...params, collection, action: "delete", type: "before" }, //
		)

		this.checkCrudPermission(afterEmit1)

		// ---------- Transaction ----------------------------
		const afterEmit3 = await this.executeTransaction(trx, async (trx) => {
			const where: any = this.joinFilterAndAuthz(afterEmit1) as Filter<Item>

			const toDeleteRecords = await repo.findWhere({ trx, where })
			const toDelete = toDeleteRecords.map(
				(original) =>
					({
						original: original as ReadonlyDeep<Item>,
						id: (original[afterEmit1.collection.pkField] as IdType) ?? throw500(7293892),
					} as const),
			)

			// if ids are provided, and user can't delete all ids, throw
			if (afterEmit1.filter.type === "ids" && afterEmit1.filter.ids.length !== toDelete.length) {
				throw403(838934, emsg.noAuthz)
			}

			// type A = ReadonlyDeep<typeof toDelete>[]

			const afterEmit2 = await this.emit<DeleteStartEvent<Item>>(
				{ ...afterEmit1, trx, toDelete, type: "start" }, //
			)

			const deleted = await repo.deleteWhere({
				trx,
				where: afterEmit2.toDelete.map((item) => item.id),
			})

			const afterEmit3 = await this.emit<DeleteFinishEvent<Item>>(
				{ ...afterEmit2, result: deleted as Item[], type: "finish" }, //
			)

			return this.omitTrx<DeleteFinishEvent<Item>>(afterEmit3)
		})
		// --------------------------------------------------------

		const afterEmit4 = await this.emit<DeleteAfterEvent<Item>>(
			{ ...afterEmit3, trx: trx, type: "after" }, //
		)

		return this.getAllowedData(afterEmit4) as Partial<Item>[]
	}
}
