import { Fields } from "@api/common"
import { throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { InfraStateService } from "@api/infra/infra-state/infra-state.service"
import { AnyMongoAbility, defineAbility } from "@casl/ability"
import { Injectable } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AllowedAction,
	AuthUser,
	CollectionDef,
	Struct,
	castArray,
	getSystemPermission,
	isNil,
	isPrimitiveDbValue,
	systemPermissions,
} from "@zmaj-js/common"
import { isEmpty, isString } from "radash"
import { Except, PartialDeep } from "type-fest"
import { AuthorizationConfig } from "./authorization.config"
import { AuthorizationRules, RulesParams } from "./authorization.rules"

type Action = "create" | "read" | "update" | "delete" | string
type Resource = string | CollectionDef

type SharedAuthzParams = {
	user?: AuthUser
	resource: Resource
	action: Action
}

type CanParams<T extends Struct = Struct> = SharedAuthzParams & {
	record?: T
	field?: string | string[]
}

type CanChangeRecordParams<T = Struct> = SharedAuthzParams & {
	changes: Partial<T>
	record: T
}

type PickFieldsParams<T extends Struct = Struct> = Pick<
	CanParams<T>,
	// "resource" | "user" | "record"
	"user" | "record"
> & {
	resource: CollectionDef
	fields?: Fields<T>
}

const allAllowed = defineAbility((can) => can("manage", "all"))

/**
 * AuthorizationService
 * @todo Check api one more type, try to improve public methods
 */
@Injectable()
export class AuthorizationService {
	constructor(
		private readonly infraState: InfraStateService,
		private readonly config: AuthorizationConfig,
		private readonly authRules: AuthorizationRules,
	) {}

	async roleRequireMfa(user: AuthUser): Promise<boolean> {
		return this.authRules.requireMfa(user)
	}

	/**
	 * We allow to check for permission by either passing resource string
	 * ("collections.posts_table", "zmaj.users"), or by passing collection (UserCollection).
	 * This is a helper method that gets name that is used is `casl`
	 * IF resource name does not include ".", we will assume it's collection name
	 */
	private getResourceName(resource: Resource): string {
		return isString(resource) ? resource : resource.authzKey
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
	canModifyResource(params: Except<CanChangeRecordParams, "record">): boolean {
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
			user: params.user,
			record: params.record,
			...getSystemPermission(resourceKey, actionKey),
		})
		//
	}

	/**
	 * Get all action that user is allowed to perform
	 * This is used for easing usage in admin panel
	 *
	 * @param user Logged in user
	 * @returns All allowed actions, `null` if user is admin
	 * @deprecated Everything that is tied to admin panel should be separate from core.
	 */
	getAllowedActions(user?: AuthUser): AllowedAction[] | null {
		// this prevents user from knowing it's permissions and server config
		if (!this.config.exposeAllowedPermissions) return []
		// if (!this.config.exposeAllowedPermissions) throw403(529378423)

		// this prevents user from knowing it's permissions
		const allowed = this.checkSystem("adminPanel", "access", { user })
		if (!allowed) return []

		// Admin can do anything
		if (user?.roleId === ADMIN_ROLE_ID) return null

		// this.checkSystem("account", "readPermissions", { user }) || throw403(89234)

		const check = this.getRules({ user: user ?? null })

		return check.rules.map((rule) => ({
			action: rule.action,
			fields: rule.fields === undefined ? null : castArray(rule.fields),
			resource: rule.subject,
		}))
	}

	/**
	 * Check if action is allowed
	 *
	 * Most generic authz hook. It does different things depending of provided data
	 * If `field` is not provided, it will check if it can read any field.
	 * If `record` is not provided, it will not check conditions, since it does not have record to
	 * check. If you can, use other methods
	 */
	check({ user, resource, action, record, field }: CanParams): boolean {
		const resourceName = this.getResourceName(resource)
		const rules = this.getRules({ user: user ?? null, action, resource: resourceName })

		const caslResource = isNil(record) ? resourceName : { ...record, __caslType: resourceName }

		if (!field) {
			return rules.can(action, caslResource)
		} else {
			return castArray(field).every((field) => rules.can(action, caslResource, field))
		}
	}

	/**
	 * Return fields that user is allowed to read. It allows providing `fields` param by which
	 * it will pick fields and check
	 *
	 * @param params
	 * @returns
	 */
	pickAllowedData<T extends Struct>(params: PickFieldsParams<T>): PartialDeep<T> {
		const { user, record, fields } = params

		const resource = this.getResourceName(params.resource)

		// const collectionName = resource.replace("collections.", "")

		const collection =
			this.infraState.getCollection(params.resource.collectionName) ?? throw500(57892342)

		const allowedData: Struct = {}

		for (const [field, value] of Object.entries(record ?? {})) {
			const fullField = collection.fields[field]
			const fullRel = collection.relations[field]

			if (fullField === undefined && fullRel === undefined) throw500(4233242)

			// if this property is not relation
			if (fullField) {
				// check if we can read this field

				const canReadField = this.check({ user, resource, action: "read", record, field })

				// if field `undefined`, or `{}`, it means give me what you can. don't throw forbidden
				if (fields === undefined || isEmpty(fields)) {
					if (canReadField) {
						allowedData[field] = value
					}
					continue
				}

				// is current field specified
				// since this is not relation, we only check if value is true (not subfields)
				const fieldSpecified = fields[field] === true

				// if field not requested, ignore it
				if (!fieldSpecified) continue

				// if field is specified and can't be reed, throw forbidden
				if (!canReadField) throw403(392634, emsg.noAuthz)

				// if specified and can read, set value

				allowedData[field] = value
			}
			// if it's relation
			else {
				// if value is nil do nothing
				// mikro orm returns pk as relation field value if it's not joined
				if (isPrimitiveDbValue(value)) continue

				// if fields are provided, and this value is not specified, ignore it
				if (fields !== undefined && !isEmpty(fields) && fields[field] === undefined) {
					continue
				}

				// this is for getting fields out of relation (relevant for both array and object)
				// if field value for this property is true, it means give me all sub-values that you can
				// (same as `undefined` above), so we are passing undefined
				const fieldsToCheck = fields?.[field] === true ? undefined : fields?.[field]

				const rightCollection =
					this.infraState.getCollection(fullRel?.otherSide.collectionName ?? "_") ??
					throw500(78323)
				// check if value is array (o2m|m2m)
				// we have to get values for every property
				if (Array.isArray(value)) {
					allowedData[field] = value.map((item) =>
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
					allowedData[field] = this.pickAllowedData({
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

		// rulesToQuery(ability, params.action, this.getResourceName(params.resource), r => r.inverted ? {$not})

		const t =
			this.getRules({
				user: params.user ?? null,
				resource: this.getResourceName(params.resource),
			}).relevantRuleFor(params.action, this.getResourceName(params.resource))?.conditions ??
			{}
		return { $and: [t] }

		// TODO Explore
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
