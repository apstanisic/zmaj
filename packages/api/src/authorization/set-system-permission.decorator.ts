import { CustomDecorator } from "@nestjs/common"
import { getSystemPermission, systemPermissions } from "@zmaj-js/common"
import { SetPermission } from "./set-permission.decorator"

export function SetSystemPermission<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof (typeof systemPermissions)[T]["actions"],
): CustomDecorator<string> {
	return SetPermission(getSystemPermission(resourceKey, actionKey))
}
