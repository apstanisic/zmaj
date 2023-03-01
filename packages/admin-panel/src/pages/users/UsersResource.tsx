import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"

export function usersResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "users", "read")
	const edit = checkSystem(props.authz, "users", "update")
	const create = checkSystem(props.authz, "users", "create")

	return (
		<Resource
			name="zmajUsers"
			list={read ? GeneratedListPage : undefined}
			show={read ? GeneratedShowPage : undefined}
			create={create ? GeneratedCreatePage : undefined}
			edit={edit ? GeneratedEditPage : undefined}
			options={{
				label: "Users",
				authzResource: systemPermissions.users.resource,
			}}
		/>
	)
}
