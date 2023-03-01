import { memo } from "react"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { WebhookForm } from "./WebhookForm"

export const WebhookCreate = memo(() => {
	return (
		<GeneratedCreatePage>
			<WebhookForm />
		</GeneratedCreatePage>
	)
})
