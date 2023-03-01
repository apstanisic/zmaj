import { isNil, Webhook } from "@zmaj-js/common"
import { diff, unique } from "radash"
import { useFormContext, useWatch } from "react-hook-form"
import { WebhooksEvents } from "./WebhooksEvents"

export function WebhookEventsInputField(): JSX.Element {
	const { setValue } = useFormContext<Partial<Webhook>>()
	const events = useWatch({ name: "events" })

	return (
		<WebhooksEvents
			events={events}
			onClick={(event, newValueChecked) => {
				if (isNil(events)) {
					setValue("events", [event])
					return
				}

				const newValue = newValueChecked //
					? unique([...events, event])
					: diff(events, [event])

				setValue("events", newValue)
			}}
		/>
	)
}
