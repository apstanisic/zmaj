import {
	FormJsonInput,
	FormMultilineTextInput,
	FormSelectInput,
	FormSwitchInput,
	FormTextInput,
} from "@admin-panel/ui/Controlled"
import { Form } from "ra-core"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { WebhookEventsInputField } from "./WebhookEventsInputField"

const options = ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ value }))

export function WebhookForm(): JSX.Element {
	return (
		<Form>
			<StepLayout sections={["Info", "Events"]}>
				<StepSection index={0}>
					<FormTextInput label="Name" name="name" />
					<FormSelectInput
						name="httpMethod"
						label="HTTP Method"
						isRequired
						defaultValue="GET"
						options={options}
					/>
					<FormMultilineTextInput label="Description" name="description" />
					<FormSwitchInput name="enabled" label="Enabled" defaultValue={false} />
					<FormSwitchInput label="Send data" name="sendData" defaultValue={false} />
					<FormTextInput label="URL" name="url" isRequired />
					<FormJsonInput
						name="httpHeaders"
						label="HTTP Headers (as JSON)"
						defaultValue={{}}
					/>
				</StepSection>
				<StepSection index={1}>
					<WebhookEventsInputField />
				</StepSection>
			</StepLayout>
		</Form>
	)
}
