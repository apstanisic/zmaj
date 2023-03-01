import { v4 } from "uuid"
import { AuthzConditionTransformer } from "../condition-transformer.type"

// Set unknown uuid if user is not logged in, that way it will never be valid
export const currentUserTransformer: AuthzConditionTransformer = {
	key: "CURRENT_USER",
	transform: (params) => params.user?.userId ?? v4(),
}
