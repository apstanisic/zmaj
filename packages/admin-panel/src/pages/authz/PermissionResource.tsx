import { PermissionCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"

const perm = PermissionCollection
export function permissionResource(): JSX.Element {
	return (
		<Resource
			name={perm.collectionName}
			options={{
				collection: PermissionCollection,
			}}
		/>
	)
}
