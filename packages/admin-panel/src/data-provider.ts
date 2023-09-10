import { CrudClient, ZmajSdk } from "@zmaj-js/client-sdk"
import {
	CollectionDef,
	IdRecord,
	Struct,
	UrlQuery,
	UrlQuerySchema,
	filterStruct,
	hasQuickFilter,
	isStruct,
	notNil,
	quickFilterPrefix,
	transformQuickFilter,
} from "@zmaj-js/common"
import { Filter, IdType } from "@zmaj-js/orm"
import { DataProvider, RaRecord } from "ra-core"
import { isEqual, mapValues } from "radash"
import { v4 } from "uuid"
import { z } from "zod"
import { AdminPanelError } from "./shared/AdminPanelError"

const MetaValues = UrlQuerySchema.pick({
	mtmCollection: true,
	mtmProperty: true,
	mtmRecordId: true,
	otmFkField: true,
	otmShowForbidden: true,
	fields: true,
})
	.extend({ getAll: z.boolean().optional() })
	.optional()

/**
 * Can't fix data provider type
 */
type DpRecord = IdRecord<any> | any

function parseFilter(filter: unknown): Filter<RaRecord> {
	if (!isStruct(filter)) throw new AdminPanelError("#33315")

	if (hasQuickFilter(filter)) {
		return transformQuickFilter(filter) as Filter<RaRecord>
	}

	// remove quick filter if exists as empty string or nil
	return filterStruct(filter as Struct, (v, key) => !key.startsWith(quickFilterPrefix))
}

/**
 * Initialize data provider
 *
 * @param sdk Sdk to be used to make request
 * @returns Data Provider
 */
export function initDataProvider(sdk: ZmajSdk, collections?: CollectionDef[]): DataProvider {
	const pkFields = Object.fromEntries(collections?.map((c) => [c.collectionName, c.pkField]) ?? [])

	// transform record whose primary key is different than id to id, so that react-admin works
	function transformRecord(resource: string, record: Struct): RaRecord {
		const pkField = pkFields[resource]
		if (pkField === undefined || pkField === "id") return record as RaRecord
		return {
			...record,
			id: record[pkField] ?? v4(), // this is not best idea
		} as RaRecord
	}

	function startCrud(resource: string): CrudClient<any, any, any> {
		if (resource === "zmajRelationMetadata") return sdk.infra.relations
		if (resource === "zmajFieldMetadata") return sdk.infra.fields
		if (resource === "zmajCollectionMetadata") return sdk.infra.collections
		if (resource === "zmajFiles") return sdk.files
		if (resource === "zmajUsers") return sdk.users
		if (resource === "zmajRoles") return sdk.roles
		if (resource === "zmajPermissions") return sdk.permissions
		if (resource === "zmajWebhooks") return sdk.webhooks

		const name = resource.startsWith("collections.")
			? resource.replace("collections.", "")
			: resource === "zmaj_auth_sessions"
			? "$auth/sessions"
			: resource.startsWith("zmaj_")
			? `$system/${resource.substring(5).replaceAll("_", "-")}`
			: resource

		return sdk.collection(name)
	}

	return {
		/**
		 * Get by ID
		 */
		async getOne(resource, { id }): Promise<{ data: DpRecord }> {
			const item = await startCrud(resource).getById({ id })
			return { data: { ...item, id } }
		},

		/**
		 * Get many by filter
		 */
		async getList(resource, params): Promise<{ data: DpRecord[]; total: number }> {
			const { filter, pagination, sort: _sort, meta } = params
			const metaValues = MetaValues.parse(meta)
			// don't sort by id, since uuid is not text sortable
			const sort: Partial<UrlQuery>["sort"] =
				_sort.field === "id"
					? undefined
					: { [_sort.field]: _sort.order.toUpperCase() === "ASC" ? "ASC" : "DESC" }

			if (params.meta?.getAll === true) {
				const res = await startCrud(resource).getAll({
					filter: parseFilter(filter),
					sort,
					...metaValues,
				})
				return {
					total: res.length,
					data: res.map((rc) => transformRecord(resource, rc)),
				}
			} else {
				const res = await startCrud(resource).getMany({
					limit: pagination.perPage,
					page: pagination.page,
					filter: parseFilter(filter),
					count: true,
					sort,
					...metaValues,
				})

				const total = res.count ?? res.data.length
				return { data: res.data.map((rc) => transformRecord(resource, rc)), total }
			}
		},

		/**
		 * Get many by ID
		 */
		async getMany(resource, { ids, meta }): Promise<{ data: DpRecord[] }> {
			const metaValues = MetaValues.parse(meta)

			const response = await startCrud(resource).getMany({
				...metaValues,
				filter: { id: { $in: ids as string[] } } as any,
			})
			return { data: response.data.map((r) => transformRecord(resource, r)) }
		},

		/**
		 * Get reference
		 */
		async getManyReference(resource, params): Promise<{ data: DpRecord[]; total: number }> {
			const { filter, id, pagination, sort, target, meta } = params
			// todo specify types
			const validMeta = UrlQuerySchema.pick({ fields: true }).optional().parse(meta)

			const res = await startCrud(resource).getMany({
				filter: { ...filter, [target]: id },
				count: true,
				limit: pagination.perPage,
				// offset: (pagination.page - 1) * 10,
				page: pagination.page,
				sort:
					sort.field !== "id"
						? { [sort.field]: sort.order.toUpperCase() === "ASC" ? "ASC" : "DESC" }
						: undefined,
				...validMeta,
			})
			return {
				data: res.data.map((r) => transformRecord(resource, r)),
				total: res.count ?? res.data.length,
			}
		},

		/**
		 * Create
		 */
		async create(resource, { data }): Promise<{ data: DpRecord }> {
			// remove empty string, and send null instead

			const values = mapValues(data, (v) => (v === "" ? null : v))
			const result = await startCrud(resource).createOne({ data: values })
			return { data: transformRecord(resource, result) }
		},

		/**
		 * Update by  ID
		 */
		async update(resource, { data, id, previousData }): Promise<{ data: DpRecord }> {
			const changes: Struct = {}

			for (const [key, value] of Object.entries(data)) {
				const newValue = value === "" ? null : value
				const oldValue = previousData[key]

				// this deep compares objects, dates. If value is the same don't send change
				// we compare by value, since they are always different ref
				if (!isEqual(newValue, oldValue)) {
					changes[key] = data[key]
				}
			}

			// If no data has been changed, don't execute request
			if (Object.keys(changes).length === 0) return { data: { id } }
			//
			const updated = await startCrud(resource).updateById({ id, data: changes })

			return { data: { ...updated, id } }
		},

		/**
		 * Update many
		 */
		async updateMany(resource, { data, ids }): Promise<{ data: IdType[] }> {
			const changes = mapValues(data, (v) => (v === "" ? null : v))
			const items = await startCrud(resource).updateByIds({ data: changes, ids })
			return { data: items.map((item) => item.id) }
		},

		/**
		 * Delete by Id
		 */
		async delete(resource, { id }): Promise<{ data: DpRecord }> {
			const item = await startCrud(resource).deleteById({ id })
			return { data: { ...item, id } }
		},

		/**
		 * Delete many
		 */
		async deleteMany(resource, { ids }): Promise<{ data: IdType[] }> {
			// never throws so it's safe to do `Promise.all`
			const results = await Promise.allSettled(
				ids.map(async (id) => startCrud(resource).deleteById({ id })),
			)
			const deleted = results
				.map((r) => (r.status === "fulfilled" ? r.value : undefined))
				.filter(notNil)
			return { data: deleted.map((row) => row.id) }
		},
	}
}
