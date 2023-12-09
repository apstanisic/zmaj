import { AuthSessionCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { AuthSessionsShow } from "./AuthSessionsShow"

/**
 * This won't get all auth session, but only those that
 */
export function authSessionsResource() {
	return (
		<Resource
			name={AuthSessionCollection.collectionName}
			list={GeneratedListPage}
			show={AuthSessionsShow} //
			options={{
				collection: AuthSessionCollection,
			}}
		/>
	)
}
