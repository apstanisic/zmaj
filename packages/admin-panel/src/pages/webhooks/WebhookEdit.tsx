import { memo } from "react"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { WebhookForm } from "./WebhookForm"

export const WebhookEdit = memo(() => {
	return (
		<GeneratedEditPage>
			<WebhookForm />
		</GeneratedEditPage>
	)
})
