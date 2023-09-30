import { throw401, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
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
import { AuthorizationConfig } from "../authorization.config"
import { AuthorizationRules, RulesParams } from "../authorization.rules"
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
		this.conditionTransformers = Object.fromEntries(
			[...builtInTransformers, ...authzConfig.customConditionTransformers].map((tr) => [
				tr.key,
				tr,
			]),
		)
	}
	async requireMfa(user: AuthUser): Promise<boolean> {
		return this.authzState.roles[user.roleId]?.requireMfa ?? false
	}

	// getRules(user?: AuthUser | undefined): AnyMongoAbility {
	// 	return this.getRules(user)
	// }

	/**
	 * Transformers that will be run
	 * Since it's property, we can easily push to add custom transformers, and is easier to test
	 */
	private readonly conditionTransformers: Record<string, AuthzConditionTransformer>

	// I can optimize this by passing resource that we need
	getRules({ action, resource, user }: RulesParams): AnyMongoAbility {
		if (user?.roleId === ADMIN_ROLE_ID) return allAllowed

		const abilities = new AbilityBuilder(createMongoAbility)
		// Users's role ID, or public role for non registered users
		const roleId = user?.roleId ?? PUBLIC_ROLE_ID
		const role = this.authzState.roles[roleId]
		// If role no longer exist, require user to sign in again
		if (!role) throw401(70039, emsg.sessionExpired)

		const relevantPermissions = resource
			? role.rules[resource] ?? [] //
			: Object.values(role.rules).flat()

		for (const permission of relevantPermissions) {
			// if user specified action they need this rule for, and is not current, skip it
			if (action && permission.action !== action) continue
			// If no field is allowed, don't add permission
			if (permission.fields && permission.fields.length === 0) continue

			// Parsed conditions with dynamic values
			const conditions = this.injectDynamicValues({ user, permission })

			// fields are readonly, so we have to copy the array, since abilities requires mutable array
			abilities.can(
				permission.action,
				// This prevents user from naming collection "all" and gaining access to everything
				permission.resource === "all" ? "collections.all" : permission.resource,
				permission.fields ?? undefined,
				conditions,
			)
		}

		const result = abilities.build({
			detectSubjectType: (data) => data["__caslType"],
			resolveAction,
		})
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
		user: AuthUser | null
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

			const valueSections = value.substring(1).split(":")
			const trKey = valueSections[0]!
			const transformer = this.conditionTransformers[trKey]
			// Should we throw here?
			// Transformer could be removed and then invalid value will be returned
			if (!transformer) throw500(4837268)
			// if (!transformer) continue

			// It will return everything after ":", or undefined if there is no ":"
			const modifier = valueSections[1]

			flatConditions[trKey] = transformer.transform({ user: user ?? undefined, modifier })
		}

		return unflatten<Struct, Struct>(flatConditions, { delimiter })
	}
}
