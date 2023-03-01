import { currentDateTransformer } from "./current-date.transformer"
import { currentRoleTransformer } from "./current-role.transformer"
import { currentUserTransformer } from "./current-user.transformer"
import { dateTransformer } from "./date.transformer"

export const builtInTransformers = [
	currentUserTransformer,
	currentRoleTransformer,
	currentDateTransformer,
	dateTransformer,
]
