import { throw500 } from "@api/common/throw-http"
import {
	AbilityBuilder,
	AnyMongoAbility,
	createAliasResolver,
	createMongoAbility,
	defineAbility,
} from "@casl/ability"
import { Injectable } from "@nestjs/common"
import {
	ADMIN_ROLE_ID,
	AuthUser,
	FLAT_DELIMITER,
	PUBLIC_ROLE_ID,
	Permission,
	Struct,
	isStruct,
} from "@zmaj-js/common"
import flat from "flat"
import { v4 } from "uuid"
import { AuthorizationConfig } from "../authorization.config"
import { AuthorizationRules } from "../rule-providers/authorization-rules.provider"
import { AuthorizationState } from "./authorization.state"
import { builtInTransformers } from "./condition-transformers"
import { AuthzConditionTransformer } from "./condition-transformers/condition-transformer.type"

const { flatten, unflatten } = flat

const allAllowed = defineAbility((can) => can("manage", "all"))

const resolveAction = createAliasResolver({
	modify: ["update", "delete", "create"],
})

@Injectable()
export class DbAuthorizationRules extends AuthorizationRules {
	constructor(
		private authzState: AuthorizationState,
		readonly authzConfig: AuthorizationConfig,
	) {
		super()
		this.conditionTransformers = [
			...builtInTransformers,
			...authzConfig.customConditionTransformers,
		]
	}
	async requireMfa(user: AuthUser): Promise<boolean> {
		return this.authzState.roles.find((r) => r.id === user?.roleId)?.requireMfa ?? false
	}

	// getRules(user?: AuthUser | undefined): AnyMongoAbility {
	// 	return this.getRules(user)
	// }

	private cache = {
		version: v4(),
		values: new Map<string, AnyMongoAbility>(),
	}

	/**
	 * Transformers that will be run
	 * Since it's property, we can easily push to add custom transformers, and is easier to test
	 */
	private readonly conditionTransformers: AuthzConditionTransformer[]

	getRules(user?: AuthUser): AnyMongoAbility {
		if (user?.roleId === ADMIN_ROLE_ID) return allAllowed

		// Cache invalidation here
		if (this.cache.version !== this.authzState.cacheVersion) {
			this.cache.version = this.authzState.cacheVersion
			this.cache.values.clear()
		}

		// get value from cache if exist
		const fromCache = this.cache.values.get(user?.userId ?? "public")
		if (fromCache) return fromCache

		// no cache

		const abilities = new AbilityBuilder(createMongoAbility)
		// Users's role ID, or public role for non registered users
		const roleId = user?.roleId ?? PUBLIC_ROLE_ID

		// Only permissions for current role
		const relevantPermissions = this.authzState.permissions.filter((p) => p.roleId === roleId)

		for (const permission of relevantPermissions) {
			// If no field is allowed, don't add permission
			if (permission.fields && permission.fields.length === 0) continue

			// Parsed conditions with dynamic values
			const conditions = this.injectDynamicValues({ user, permission })

			// fields are readonly, so we have to copy the array, since abilities requires mutable array
			abilities.can(
				permission.action,
				// TODO This prevents user from having table named all
				// This prevents user from naming collection "all" and gaining access to everything
				permission.resource === "all" ? "collections.all" : permission.resource,
				// convert readonly version to normal array, since it's required by casl
				// this is for ts mostly. If it's undefined all fields are allowed
				permission.fields?.concat() ?? undefined,
				conditions,
			)
		}

		const result = abilities.build({
			detectSubjectType: (data) => data["__caslType"],
			resolveAction,
		})
		// cache value
		this.cache.values.set(user?.userId ?? "public", result)
		return result
	}

	/**
	 * Inject runtime values to condition
	 *
	 * Because conditions are serialized, we have to convert placeholders to real value.
	 * We can't store if conditions in database, so we have to use transformer.
	 * For example: $CURRENT_TIME to new Date(), $CURRENT_USER for current user id
	 *
	 * For example, it transforms bellow condition:
	 * ```js
	 * { createdAt: { $lte: '$CURRENT_DATE:2d' } // from
	 * { createdAt: { $lte: new Date() + "add 2 days" } // to
	 * ```
	 */
	private injectDynamicValues({
		user,
		permission,
	}: {
		permission: Readonly<Permission>
		user?: AuthUser
	}): Struct {
		const delimiter = FLAT_DELIMITER
		const conditions = permission.conditions ?? {}
		if (!isStruct(conditions)) throw500(3992)
		const flatConditions = flatten<Struct, Struct>(conditions, { delimiter })

		for (const [key, value] of Object.entries(flatConditions)) {
			if (typeof value !== "string") continue

			if (value.startsWith("_$")) {
				flatConditions[key] = value.substring(1)
				continue
			}

			if (!value.startsWith("$")) continue

			const transformer = this.conditionTransformers.find((hook) =>
				`${value}`.startsWith("$" + hook.key),
			)
			// Should we throw here?
			// Transformer could be removed and then invalid value will be returned
			if (!transformer) throw500(4837268)
			// if (!transformer) continue

			// It will return everything after ":", or undefined if there is no ":"
			const modifier = `${value}`.split(":")[1]

			flatConditions[key] = transformer.transform({ user, modifier })
		}

		return unflatten<Struct, Struct>(flatConditions, { delimiter })
	}
}
