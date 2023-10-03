import { AbilityOptions, AnyMongoAbility, createAliasResolver } from "@casl/ability"
import { AuthUser } from "@zmaj-js/common"
import { detectSubjectType } from "./authorization.utils"

export type RulesParams = {
	/**
	 * User that is attempting actions on resource
	 * We require that we pass user as `null`. This is a little DX annoyance
	 * cause it requires `user: user ?? null`, but it prevents bug, cause it's easy
	 * to forget to pass user, in which case we would get public roles, which is not what we want
	 */
	user: AuthUser | null
	/**
	 * Resource for which we want rules. If resource is not provided
	 * return for all possible resources.
	 */
	resource?: string
	/**
	 * Action for which we want rules. If action is not provided
	 * return for all possible actions.
	 */
	action?: string //
}

export abstract class AuthorizationRules {
	abstract getRules(params: RulesParams): AnyMongoAbility

	protected getBuildOptions(): AbilityOptions<any, any> {
		return {
			detectSubjectType,
			resolveAction: createAliasResolver({
				modify: ["update", "delete", "create"],
			}),
		}
	}
}
