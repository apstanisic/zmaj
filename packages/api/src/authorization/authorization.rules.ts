import { AnyMongoAbility } from "@casl/ability"
import { AuthUser } from "@zmaj-js/common"

export abstract class AuthorizationRules {
	abstract requireMfa(user: AuthUser): Promise<boolean>
	abstract getRules(user?: AuthUser): AnyMongoAbility
}
