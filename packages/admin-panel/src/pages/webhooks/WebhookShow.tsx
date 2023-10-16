import { BooleanShowField } from "@admin-panel/field-components/boolean/BooleanShowField"
import { DateTimeShowField } from "@admin-panel/field-components/datetime/DateTimeShowField"
import { KeyValueShowField } from "@admin-panel/field-components/key-value/KeyValueShowField"
import { UrlShowField } from "@admin-panel/field-components/url/UrlShowField"
import { useRecord } from "@admin-panel/hooks/use-record"
import { ManualShowField } from "@admin-panel/shared/show/ManualShowField"
import { Webhook } from "@zmaj-js/common"
import { memo } from "react"
import { TabsLayout } from "../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { WebhooksEvents } from "./WebhooksEvents"

/**
 * TODO Add ability for plugins to inject permissions
 */
export const WebhookShow = memo(() => {
	return (
		<GeneratedShowPage>
			<Content />
		</GeneratedShowPage>
	)
})

// Has to be inside `Show` so we can access record context
const Content = (): JSX.Element => {
	const record = useRecord<Webhook>()

	return (
		<TabsLayout sections={["Options", "Events"]}>
			<TabsSection>
				<ManualShowField source="id" />
				<ManualShowField source="name" />
				<ManualShowField source="httpMethod" />
				<ManualShowField source="description" />
				<ManualShowField source="createdAt" Component={DateTimeShowField} />
				<ManualShowField source="enabled" Component={BooleanShowField} />
				<ManualShowField source="sendData" Component={BooleanShowField} />
				<ManualShowField source="url" Component={UrlShowField} />
				<ManualShowField source="httpHeaders" Component={KeyValueShowField} />
			</TabsSection>
			<TabsSection>
				<WebhooksEvents events={record?.events ?? []} />
			</TabsSection>
		</TabsLayout>
	)
}
