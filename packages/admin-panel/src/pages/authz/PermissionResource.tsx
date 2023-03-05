import { PermissionCollection, systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"

export function permissionResource(): JSX.Element {
	return (
		<Resource
			name={PermissionCollection.collectionName}
			options={{
				label: PermissionCollection.label ?? "Permissions",
				authzResource: systemPermissions.authorization.resource,
				authzActions: {
					create: systemPermissions.authorization.actions.modify.key,
					delete: systemPermissions.authorization.actions.modify.key,
					edit: systemPermissions.authorization.actions.modify.key,
					list: systemPermissions.authorization.actions.read.key,
					show: systemPermissions.authorization.actions.read.key,
				},
			}}
		/>
	)
}
