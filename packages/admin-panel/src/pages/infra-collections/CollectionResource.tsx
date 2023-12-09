import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { CollectionMetadataCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { CollectionCreate } from "./CollectionCreate"
import { CollectionEdit } from "./CollectionEdit"
import { CollectionList } from "./CollectionList"
import { CollectionShow } from "./CollectionShow"

const col = CollectionMetadataCollection
export function collectionResource(props: { authz: Authz }) {
	const read = checkSystem(props.authz, "infra", "read")
	const modify = checkSystem(props.authz, "infra", "modify")
	return (
		<Resource
			name={col.collectionName}
			show={read ? CollectionShow : undefined}
			list={read ? CollectionList : undefined}
			edit={modify ? CollectionEdit : undefined}
			create={modify ? CollectionCreate : undefined}
			options={{
				collection: CollectionMetadataCollection,
			}}
		/>
	)
}
