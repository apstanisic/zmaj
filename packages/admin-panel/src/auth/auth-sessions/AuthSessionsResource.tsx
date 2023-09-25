import { AuthSessionCollection, systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { AuthSessionsShow } from "./AuthSessionsShow"

const as = AuthSessionCollection
/**
 * This won't get all auth session, but only those that
 */
export function authSessionsResource(): JSX.Element {
	return (
		<Resource
			name={as.collectionName}
			list={GeneratedListPage}
			show={AuthSessionsShow} //
			options={{
				authzResource: systemPermissions.account.resource,
				label: as.label ?? "Sessions",
				authzActions: {
					list: systemPermissions.account.actions.readSessions.key,
					show: systemPermissions.account.actions.readSessions.key,
				},
			}}
		/>
	)
}
