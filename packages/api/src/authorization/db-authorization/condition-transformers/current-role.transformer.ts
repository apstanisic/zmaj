import { PUBLIC_ROLE_ID } from "@zmaj-js/common"
import { AuthzConditionTransformer } from "./condition-transformer.type"

// Set unknown uuid if user is not logged in, that way it will never be valid
export const currentRoleTransformer: AuthzConditionTransformer = {
	key: "CURRENT_ROLE",
	transform: (params) => params.user?.roleId ?? PUBLIC_ROLE_ID,
}
