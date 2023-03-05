import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { FileCollection, systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { FileEdit } from "./FileEdit"
import { FilesList } from "./FilesList"
import { FilesShow } from "./FilesShow"

export function filesResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "files", "read")
	const edit = checkSystem(props.authz, "files", "update")
	return (
		<Resource
			name={FileCollection.collectionName}
			list={read ? FilesList : undefined}
			show={read ? FilesShow : undefined}
			edit={edit ? FileEdit : undefined}
			options={{
				label: FileCollection.label ?? undefined,
				authzResource: systemPermissions.files.resource,
			}}
		/>
	)
}
