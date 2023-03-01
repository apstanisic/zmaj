import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { CollectionCreate } from "./CollectionCreate"
import { CollectionEdit } from "./CollectionEdit"
import { CollectionList } from "./CollectionList"
import { CollectionShow } from "./CollectionShow"

export function collectionResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "infra", "read")
	const modify = checkSystem(props.authz, "infra", "modify")
	return (
		<Resource
			name="zmaj_collection_metadata"
			show={read ? CollectionShow : undefined}
			list={read ? CollectionList : undefined}
			edit={modify ? CollectionEdit : undefined}
			create={modify ? CollectionCreate : undefined}
			options={{
				label: "Collections",
				authzResource: systemPermissions.infra.resource,
			}}
		/>
	)
}
