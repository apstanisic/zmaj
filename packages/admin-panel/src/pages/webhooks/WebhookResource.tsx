import { checkSystem } from "@admin-panel/hooks/use-is-allowed"
import { Authz } from "@admin-panel/state/authz-state"
import { WebhookCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { WebhookCreate } from "./WebhookCreate"
import { WebhookEdit } from "./WebhookEdit"
import { WebhookShow } from "./WebhookShow"

export function webhookResource(props: { authz: Authz }) {
	const read = checkSystem(props.authz, "webhooks", "read")
	const edit = checkSystem(props.authz, "webhooks", "update")
	const create = checkSystem(props.authz, "webhooks", "create")

	return (
		<Resource
			name={WebhookCollection.collectionName}
			list={read ? GeneratedListPage : undefined}
			show={read ? WebhookShow : undefined}
			edit={edit ? WebhookEdit : undefined}
			create={create ? WebhookCreate : undefined}
			options={{
				collection: WebhookCollection,
			}}
		/>
	)
}
