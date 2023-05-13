import { CustomDecorator, SetMetadata } from "@nestjs/common"
import { getSystemPermission, systemPermissions } from "@zmaj-js/common"

export function SetSystemPermission<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof (typeof systemPermissions)[T]["actions"],
): CustomDecorator<string> {
	return SetMetadata("authz", getSystemPermission(resourceKey, actionKey))
}
