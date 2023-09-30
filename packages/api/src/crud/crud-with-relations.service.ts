import { throw400, throw403, throw404, throw500 } from "@api/common/throw-http"
import type { CrudCreateParams, CrudUpdateParams, SharedParams } from "@api/crud/crud-event.types"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { Injectable } from "@nestjs/common"
import {
	CollectionDef,
	RelationDef,
	Struct,
	ToManyChange,
	ToManyChangeSchema,
} from "@zmaj-js/common"
import { IdType, RepoManager, Transaction } from "@zmaj-js/orm"
import { z } from "zod"
import { CrudCreateService } from "./crud-create.service"
import { CrudDeleteService } from "./crud-delete.service"
import { CrudUpdateService } from "./crud-update.service"
import { CrudConfig } from "./crud.config"

@Injectable()
export class CrudWithRelationsService<Item extends Struct = Struct> {
	constructor(
		private readonly state: InfraStateService,
		private readonly repoManager: RepoManager,
		private readonly del: CrudDeleteService,
		private readonly update: CrudUpdateService<Item>,
		private readonly create: CrudCreateService,
		private readonly config: CrudConfig,
	) {}

	/**
	 * @todo Write tests
	 */
	async createOne(data: Struct, params: Omit<CrudCreateParams<Item>, "dto">): Promise<Item> {
		const { collection, fields, relations } = this.separateFieldAndRelationChanges(
			data,
			params.collection,
		)
		return this.repoManager.transaction({
			fn: async (trx) => {
				// if (params.filter.type !== "id") throw500(38923)
				const created = await this.create.createOne(fields, { ...params, trx })
				const id = created[collection.pkField] ?? throw500(38903)

				for (const [property, change] of Object.entries(relations)) {
					const relation = collection.relations[property]!
					await this.handleToManyChange({
						mainRecordId: id as IdType,
						trx,
						change,
						relation,
						params,
					})
				}
				return created as Item
			},
		})
	}

	separateFieldAndRelationChanges(
		data: Struct,
		collection: string | CollectionDef,
	): {
		fields: Struct<unknown>
		relations: Struct<z.infer<typeof ToManyChangeSchema>>
		collection: CollectionDef
	} {
		const col = this.state.getCollection(collection) ?? throw404(9324833, emsg.notFound())

		const fieldData: Struct = {}
		const toManyData: Struct<z.infer<typeof ToManyChangeSchema>> = {}

		for (const [propertyName, propertyValue] of Object.entries(data)) {
			// if field it's standard change
			if (col.fields[propertyName]) {
				fieldData[propertyName] = propertyValue
			}
			// if relation change and rel changes are forbidden, throw
			else if (this.config.relationChange === "none") {
				throw403(3789234, emsg.invalidPayload)
			}
			// if o2m or m2m, allow changing fks
			else if (
				["many-to-many", "one-to-many"].includes(col.relations[propertyName]?.type ?? "_")
			) {
				const changes = ToManyChangeSchema.parse(propertyValue)
				// validate that changes are in correct format
				toManyData[propertyName] = changes
			}
			// 400 err for now. Maybe allow in the future
			else {
				// TODO Implement change for ref one-to-one
				throw400(852932, emsg.invalidPayloadKey(propertyName))
			}
		}
		return {
			fields: fieldData,
			relations: toManyData,
			collection: col as CollectionDef,
		}
	}

	async updateById(id: IdType, params: Omit<CrudUpdateParams<Item>, "filter">): Promise<Item> {
		const { fields, relations, collection } = this.separateFieldAndRelationChanges(
			params.changes,
			params.collection,
		)

		return this.repoManager.transaction({
			trx: params.trx,
			fn: async (trx) => {
				/// TODO Handle when we change only relations, and no normal field.
				const updated = await this.update.updateById(id, {
					...params,
					changes: fields,
					trx,
				})

				for (const [property, change] of Object.entries(relations)) {
					const relation = collection.relations[property]!
					await this.handleToManyChange({
						mainRecordId: id,
						trx,
						change,
						relation,
						params,
					})
				}
				return updated as Item
			},
		})
	}

	/**
	 * This is same for both update and create, since we will create record before calling this method
	 * So in the case, it's same for update, since we are updating newly created record.
	 */
	async handleToManyChange(props: {
		mainRecordId: IdType
		trx: Transaction
		change: ToManyChange
		relation: RelationDef
		params: Pick<SharedParams, "user" | "req">
	}): Promise<void> {
		const { trx, change, relation, params, mainRecordId } = props
		//
		if (relation.type === "one-to-many") {
			if (change.added.length > 0) {
				await this.update.updateWhere({
					trx,
					req: params.req,
					user: params.user,
					collection: relation.otherSide.collectionName,
					filter: { type: "ids", ids: change.added },
					changes: { [relation.otherSide.fieldName]: mainRecordId },
				})
			}

			if (change.removed.length > 0) {
				await this.update.updateWhere({
					trx,
					req: params.req,
					user: params.user,
					collection: relation.otherSide.collectionName,
					filter: { type: "ids", ids: change.removed },
					changes: { [relation.otherSide.fieldName]: null } as any,
				})
			}
		}

		if (relation.type === "many-to-many") {
			if (change.removed.length > 0) {
				const removed = await this.del.deleteWhere({
					trx,
					user: params.user,
					req: params.req,
					collection: relation.junction.collectionName,
					// remove from junction table, where left field is record ID, and right id is id
					// that user wants to delete
					filter: {
						type: "where",
						where: {
							[relation.junction.thisSide.fieldName]: mainRecordId,
							[relation.junction.otherSide.fieldName]: { $in: change.removed },
						},
					},
				})
				// we know how many rows we want to delete. If some row is not deleted throw 403
				if (removed.length < change.removed.length) throw403(392343, emsg.noAuthz)
			}

			if (change.added.length > 0) {
				await this.create.createMany({
					trx,
					user: params.user,
					req: params.req,
					collection: relation.junction.collectionName,
					// add to junction table, where left field is record ID, and right id is id
					// that user want to join
					dto: change.added.map((addedId) => ({
						[relation.junction.thisSide.fieldName]: mainRecordId,
						[relation.junction.otherSide.fieldName]: addedId,
					})),
				})
			}
		}
	}
}
