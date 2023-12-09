import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { FileCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { FileEdit } from "./FileEdit"
import { FilesList } from "./FilesList"
import { FilesShow } from "./FilesShow"

const file = FileCollection

export function filesResource(props: { authz: Authz }) {
	const read = checkSystem(props.authz, "files", "read")
	const edit = checkSystem(props.authz, "files", "update")
	return (
		<Resource
			name={file.collectionName}
			list={read ? FilesList : undefined}
			show={read ? FilesShow : undefined}
			edit={edit ? FileEdit : undefined}
			options={{
				collection: FileCollection,
			}}
		/>
	)
}
