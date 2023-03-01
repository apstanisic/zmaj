import { systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"

export function permissionResource(): JSX.Element {
	return (
		<Resource
			name="zmaj_permissions"
			options={{
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
