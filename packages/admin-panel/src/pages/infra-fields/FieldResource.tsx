import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { FieldCreate } from "./FieldCreate"
import { FieldEdit } from "./FieldEdit"
import { FieldShow } from "./FieldShow"

export function fieldResource(props: { authz: Authz }): JSX.Element {
	const read = checkSystem(props.authz, "infra", "read")
	const modify = checkSystem(props.authz, "infra", "modify")
	return (
		<Resource
			name="zmaj_field_metadata"
			show={read ? FieldShow : undefined}
			create={modify ? FieldCreate : undefined}
			edit={modify ? FieldEdit : undefined}
			options={{
				label: "Fields", //
				authzResource: systemPermissions.infra.resource,
			}}
		/>
	)
}
