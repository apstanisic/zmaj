import { AnyMongoAbility } from "@casl/ability"
import { CollectionDef } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedCreatePage } from "./pages/GeneratedCreatePage"
import { GeneratedEditPage } from "./pages/GeneratedEditPage"
import { GeneratedListPage } from "./pages/GeneratedListPage"
import { GeneratedShowPage } from "./pages/GeneratedShowPage"

/**
 * It's a function, not a component, because RA expect AdminUI children to be Resource
 *
 * This is not a component! You can't call `<generateResource {...props}/>`
 * `react-admin` expects that children of `Admin` be `Resource` components,
 * so this is a function that returns element, and it won't be visible in vDOM.
 */
export function generateResource(collection: CollectionDef, authz: AnyMongoAbility): JSX.Element {
	return (
		<Resource
			options={{ collection }}
			key={collection.collectionName}
			name={collection.collectionName}
			list={authz.can("read", collection.authzKey) ? GeneratedListPage : undefined}
			show={authz.can("read", collection.authzKey) ? GeneratedShowPage : undefined}
			edit={authz.can("update", collection.authzKey) ? GeneratedEditPage : undefined}
			create={authz.can("create", collection.authzKey) ? GeneratedCreatePage : undefined}
		/>
	)
}
