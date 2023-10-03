import { Fields } from "@api/common"
import { throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { AnyMongoAbility, defineAbility } from "@casl/ability"
import { Injectable } from "@nestjs/common"
import {
	AuthUser,
	CollectionDef,
	Struct,
	castArray,
	getSystemPermission,
	systemPermissions,
} from "@zmaj-js/common"
import { isEmpty, isString } from "radash"
import { LiteralUnion, PartialDeep } from "type-fest"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationRules, RulesParams } from "./authorization.rules"
import { toSubject } from "./authorization.utils"

type Action = LiteralUnion<"create" | "read" | "update" | "delete", string>
type Resource = CollectionDef | string
type ResourceName = `${string}.${string}`

type SharedAuthzParams = {
	user?: AuthUser
	resource: Resource
	action: Action
}

type CanParams<T extends Struct = Struct> = SharedAuthzParams & {
	record?: T
	field?: string | string[]
}

type CanChangeResourceParams<T = Struct> = SharedAuthzParams & {
	changes: Partial<T>
}

type CanChangeRecordParams<T = Struct> = SharedAuthzParams & {
	changes: Partial<T>
	record: T
}

type PickFieldsParams<T extends Struct = Struct> = Pick<CanParams<T>, "user" | "record"> & {
	resource: CollectionDef
	fields?: Fields<T>
}

const allAllowed = defineAbility((can) => can("manage", "all"))

/**
 * AuthorizationService
 * @todo Create additional service that will contain methods that are specific to CRUD
 * getCrudFilter, getAllowedFields, maybe???
 *
 */
@Injectable()
export class AuthorizationService {
	constructor(
		private readonly infraState: InfraStateService,
		private readonly config: AuthorizationConfig,
		private readonly authRules: AuthorizationRules,
	) {}

	/**
	 * We allow to check for permission by either passing resource string
	 * ("collections.posts_table", "zmaj.users"), or by passing collection (UserCollection).
	 * This is a helper method that gets name that is used is `casl`
	 * If resource name does not include ".", we will assume it's collection name
	 */
	private getResourceName(resource: Resource): ResourceName {
		const name = isString(resource) ? resource : resource.authzKey
		return name.includes(".") ? (name as ResourceName) : `collections.${name}`
	}

	/**
	 *
	 * Check if user can change specific record.
	 *
	 * This will check if conditions are fulfilled, and that every field is allowed to change
	 *
	 * ```js
	 * const allowedSpecificRecordToUpdate = service.canChangeRecord({
	 *   user: someAuthUser,
	 *   changes: { name: "Test" },
	 *   resource: "test_table",
	 *   action: "update",
	 *   record: { id: 5, name: "Example" }
	 * })
	 * ```
	 */
	canModifyRecord(params: CanChangeRecordParams): boolean {
		const { changes, ...rest } = params
		const fields = Object.keys(changes)
		return this.check({ ...rest, field: fields })
	}

	/**
	 * Check if user can modify resource
	 *
	 * It checks if user can change any records (ignores condition, since we don't have data).
	 * We will take `changes` param, and check if every field can be changed. If not return `false`.
	 *
	 * @example
	 * ```js
	 * const allowedSomeRecordToUpdate = service.canModifyResource({
	 *   user: jwtUser,
	 *   changes: { name: "Test" },
	 *   resource: "test_table",
	 *   action: "update",
	 * })
	 * ```
	 */
	canModifyResource(params: CanChangeResourceParams): boolean {
		const { changes, ...rest } = params
		const fields = Object.keys(changes)
		return this.check({ ...rest, field: fields })
	}

	/**
	 * Check system permission
	 * This is mainly typescript type helper for `check`
	 *
	 * @param resourceKey System resource
	 * @param actionKey System action
	 * @param params.user User that checks for this permission
	 * @param params.data data to check for conditions
	 */
	checkSystem<T extends keyof typeof systemPermissions>(
		resourceKey: T,
		actionKey: keyof (typeof systemPermissions)[T]["actions"],
		params: {
			user?: AuthUser
			record?: Struct<any>
		},
	): boolean {
		return this.check({
			...params,
			...getSystemPermission(resourceKey, actionKey),
		})
		//
	}

	/**
	 * Check if action is allowed
	 *
	 * Most generic authz hook. It does different things depending of provided data
	 * If `field` is not provided, it will check if it can read any field.
	 * If `record` is not provided, it will not check conditions, since it does not have record to
	 * check. In some cases, there are specialized methods that should be used before this
	 */
	check({ user, resource, action, record, field }: CanParams): boolean {
		const resourceName = this.getResourceName(resource)
		const rules = this.getRules({ user: user ?? null, action, resource: resourceName })

		const caslResource = toSubject(resourceName, record)

		if (!field) {
			return rules.can(action, caslResource)
		} else {
			return castArray(field).every((field) => rules.can(action, caslResource, field))
		}
	}

	/**
	 * Return fields that user is allowed to read. It allows providing `fields` param by which
	 * it will pick fields and check
	 * @internal
	 */
	pickAllowedData<T extends Struct>(params: PickFieldsParams<T>): PartialDeep<T> {
		const { user, record, fields } = params

		const resource = this.getResourceName(params.resource)

		const collection = this.infraState.getCollection(params.resource) ?? throw500(57892342)

		const allowedData: Struct = {}

		for (const [propertyName, value] of Object.entries(record ?? {})) {
			const fieldDef = collection.fields[propertyName]
			const relDef = collection.relations[propertyName]

			// if (fieldDef === undefined && relDef === undefined) throw500(4233242)

			if (fieldDef) {
				// check if we can read this field

				const canReadField = this.check({
					user,
					resource,
					action: "read",
					record,
					field: propertyName,
				})

				// if field `undefined`, or `{}`, it means give me what you can. don't throw forbidden
				if (fields === undefined || isEmpty(fields) || fields["$fields"]) {
					if (canReadField) {
						allowedData[propertyName] = value
					}
					continue
				}
				// if field is requested and forbidden, throw
				else if (fields[propertyName] && !canReadField) {
					throw403(392634, emsg.noAuthz)
				}
				// if field is not requested, do nothing
				else if (fields[propertyName] === undefined) {
					continue
				}
				// if field requested and allowed, set value
				else if (fields[propertyName] && canReadField) {
					allowedData[propertyName] = value
				}
			}
			// if it's relation
			else if (relDef) {
				// should never happen
				if (typeof value !== "object") continue
				// Ignore relation unless specified
				if (fields === undefined || isEmpty(fields)) continue
				// ignore if not requested
				if (fields[propertyName] === undefined) continue

				// this is for getting fields out of relation (relevant for both array and object)
				// if field value for this property is true, it means give me all sub-values that you can
				// (same as `undefined` above), so we are passing undefined
				const fieldsToCheck = fields[propertyName] // fields[propertyName] ? undefined : fields[propertyName]

				const rightCollection =
					this.infraState.getCollection(relDef.otherSide.collectionName ?? "_") ??
					throw500(78323)
				// check if value is array (o2m|m2m)
				// we have to get values for every property
				if (Array.isArray(value)) {
					allowedData[propertyName] = value.map((item) =>
						this.pickAllowedData({
							user,
							record: item,
							// resource: `collections.${infraProperty.rightCollectionName}`,
							resource: rightCollection,
							fields: fieldsToCheck === true ? undefined : fieldsToCheck,
						}),
					)
				} else {
					// if value is object m2o
					allowedData[propertyName] = this.pickAllowedData({
						user,
						record: value as Struct,
						fields: fieldsToCheck === true ? undefined : fieldsToCheck,
						resource: rightCollection,
						// resource: `collections.${infraProperty.rightCollectionName}`,
					})
				}
			}
		}

		return allowedData as PartialDeep<T>
	}

	/**
	 * Get conditions that is needed to read this record.
	 *
	 * This method is use in crud service, so we only fetch data that user can "action" on it.
	 * There is no point in crud read some data, if user can not read it. And it also messes up pagination
	 * We merge this with user provided filter when querying database
	 * This does not check if some action is allowed.
	 * Return empty object if there are no conditions
	 *
	 * @internal
	 * @example
	 * ```js
	 * const conditions = service.getAuthzAsOrmFilter({
	 *   user: userFromJwt,
	 *   action: "read", // or "update"...
	 *   resource: "some_table",
	 * })
	 * ```
	 *
	 */
	getAuthzAsOrmFilter(params: Pick<CanParams, "user" | "action" | "resource">): {
		$and: Struct[]
	} {
		const ability = this.getRules({
			user: params.user ?? null,
			action: params.action,
			resource: this.getResourceName(params.resource),
		})

		const conditions =
			ability.relevantRuleFor(params.action, this.getResourceName(params.resource))
				?.conditions ?? {}

		if (isEmpty(conditions)) return { $and: [] }

		return { $and: [conditions] }

		// TODO Explore
		// rulesToQuery(ability, params.action, this.getResourceName(params.resource), r => r.inverted ? {$not})
		// const filter = accessibleBy(ability, params.action)[
		// 	this.getResourceName(params.resource)
		// ] ?? { $and: [] }

		// return filter as any
		// return { $and: [filter] }
	}

	getRules(params: RulesParams): AnyMongoAbility {
		// if authz is disabled, return rule that allows everything
		if (this.config.disable) return allAllowed
		return this.authRules.getRules(params)
	}
}
