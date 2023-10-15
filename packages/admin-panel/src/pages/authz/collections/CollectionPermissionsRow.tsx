import { useRecord } from "@admin-panel/hooks/use-record"
import { Table } from "@admin-panel/ui/Table"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ADMIN_ROLE_ID, CollectionDef, Permission, Role } from "@zmaj-js/common"
import { ReactElement, useCallback, useMemo } from "react"
import { PermissionStateIcon } from "../_PermissionStateIcon"
import { useAuthzDialogState } from "../dialog/authz-dialog-state"

export function CollectionPermissionsRow(props: {
	allowedPermissions: Permission[]
	collection: CollectionDef
}): ReactElement {
	const role = useRecord<Role>()

	const showDialog = useAuthzDialogState().showDialog

	const currentPermission = useMemo(() => {
		const collectionPermissions = props.allowedPermissions.filter(
			(p) => p.resource === `collections.${props.collection.collectionName}`,
		)
		// We get all permissions for current collection
		const read = collectionPermissions.find((p) => p.action === "read")
		const create = collectionPermissions.find((p) => p.action === "create")
		const update = collectionPermissions.find((p) => p.action === "update")
		const del = collectionPermissions.find((p) => p.action === "delete")
		return { read, create, update, del }
	}, [props.allowedPermissions, props.collection.collectionName])

	const getIconButton = useCallback(
		(permission: Permission | undefined, action: string) => {
			const resource = `collections.${props.collection.collectionName}`
			return (
				<Table.Column className="text-center">
					<IconButton
						// size="large"
						aria-label={`Show permission dialog for ${action} ${resource}`}
						isDisabled={role?.id === ADMIN_ROLE_ID}
						onPress={() =>
							showDialog({
								action,
								resource,
								availableFields:
									action === "delete"
										? null
										: Object.keys(props.collection.fields),
								fields: permission?.fields?.concat() ?? null,
							})
						}
					>
						<PermissionStateIcon permission={permission} role={role} />
					</IconButton>
				</Table.Column>
			)
		},
		[props.collection, role, showDialog],
	)

	return (
		<>
			<Table.Column className="text-lg">{props.collection.tableName}</Table.Column>
			{getIconButton(currentPermission.read, "read")}
			{getIconButton(currentPermission.create, "create")}
			{getIconButton(currentPermission.update, "update")}
			{getIconButton(currentPermission.del, "delete")}
		</>
	)
}
