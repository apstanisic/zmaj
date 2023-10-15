import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { RelationMetadataCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { RelationCreate } from "./RelationCreate"
import { RelationEdit } from "./RelationEdit"
import { RelationShow } from "./RelationShow"

const relation = RelationMetadataCollection

export function relationResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "infra", "read")
	const modify = checkSystem(props.authz, "infra", "modify")
	return (
		<Resource
			name={relation.collectionName}
			show={read ? RelationShow : undefined}
			create={modify ? RelationCreate : undefined}
			edit={modify ? RelationEdit : undefined}
			options={{
				collection: RelationMetadataCollection,
			}}
		/>
	)
}
