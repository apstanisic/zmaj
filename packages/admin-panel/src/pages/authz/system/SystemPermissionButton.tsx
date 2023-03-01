import { useRecord } from "@admin-panel/hooks/use-record"
import { Button } from "@admin-panel/ui/Button"
import { ADMIN_ROLE_ID, Permission, Role, SystemResourcePermissions } from "@zmaj-js/common"
import { title } from "radash"
import { useMemo } from "react"
import { useAuthzDialogState } from "../dialog/authz-dialog-state"
import { PermissionStateIcon } from "../_PermissionStateIcon"

type SystemPermissionButtonProps = {
	action: string
	permission: SystemResourcePermissions
	allowedPermissions: Permission[]
}

export function SystemPermissionButton(props: SystemPermissionButtonProps): JSX.Element {
	const { allowedPermissions, permission, action } = props

	const showDialog = useAuthzDialogState().showDialog

	const role = useRecord<Role>()

	const permissionAlreadyAllowed = useMemo(
		() => allowedPermissions.find((p) => p.action === action && p.resource === permission.resource),
		[allowedPermissions, action, permission.resource],
	)

	// const disabledFields = permission.actions[action]?.fields === false
	const label = permission.actions[action]?.label ?? title(action)
	const fields = permission.actions[action]?.fields ?? permission.fields

	return (
		<Button
			// variant="outlined"
			outline
			onClick={() =>
				showDialog({
					action,
					availableFields: fields === false ? null : fields ?? null,
					fields: permissionAlreadyAllowed?.fields?.concat() ?? null,
					resource: permission.resource,
				})
			}
			className="text-left"
			disabled={role?.id === ADMIN_ROLE_ID}
			startIcon={<PermissionStateIcon permission={permissionAlreadyAllowed} role={role} />}
		>
			{label}
		</Button>
	)
}
