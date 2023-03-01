import { CustomDecorator, SetMetadata } from "@nestjs/common"
import { AuthzParams } from "./authorization.guard"

export function SetPermission(permission: AuthzParams): CustomDecorator<string> {
	return SetMetadata("authz", permission)
}
