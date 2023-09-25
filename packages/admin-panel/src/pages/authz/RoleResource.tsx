import { GeneratedCreatePage } from "@admin-panel/generator/pages/GeneratedCreatePage"
import { GeneratedEditPage } from "@admin-panel/generator/pages/GeneratedEditPage"
import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { RoleCollection, systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
// import { roleCreate } from "./roleCreate"
// import { roleList } from "./roleList"
import { RoleShow } from "./RoleShow"

const role = RoleCollection
//
export function roleResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "authorization", "read")
	const modify = checkSystem(props.authz, "authorization", "modify")

	return (
		<Resource
			name={role.collectionName}
			list={read ? GeneratedListPage : undefined}
			show={read ? RoleShow : undefined}
			create={modify ? GeneratedCreatePage : undefined}
			edit={modify ? GeneratedEditPage : undefined}
			options={{
				label: role.label ?? undefined,
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
