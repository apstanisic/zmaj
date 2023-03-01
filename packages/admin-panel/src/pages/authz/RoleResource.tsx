import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { RoleCreate } from "./RoleCreate"
import { RoleEdit } from "./RoleEdit"
// import { roleCreate } from "./roleCreate"
// import { roleList } from "./roleList"
import { RoleShow } from "./RoleShow"

//
export function roleResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "authorization", "read")
	const modify = checkSystem(props.authz, "authorization", "modify")

	return (
		<Resource
			name="zmajRoles"
			list={read ? GeneratedListPage : undefined}
			show={read ? RoleShow : undefined}
			create={modify ? RoleCreate : undefined}
			edit={modify ? RoleEdit : undefined}
			options={{
				label: "Roles",
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
