import {
	FormMultilineTextInput,
	FormSelectInput,
	FormSwitchInput,
	FormTextInput,
} from "@admin-panel/ui/Controlled"
import { Form } from "ra-core"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { KeyValueInputField } from "../../field-components/key-value/KeyValueInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { WebhookEventsInputField } from "./WebhookEventsInputField"

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
						options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({
							value,
						}))}
					/>
					<FormMultilineTextInput label="Description" name="description" />
					<FormSwitchInput name="enabled" label="Enabled" defaultValue={false} />
					<FormSwitchInput label="Send data" name="sendData" defaultValue={false} />
					<FormTextInput label="URL" name="url" isRequired />
					{/* 					Component={UrlInputField} /> */}
					<ManualInputField
						source="httpHeaders"
						label="HTTP Headers (as JSON)"
						Component={KeyValueInputField}
					/>
				</StepSection>
				<StepSection index={1}>
					<WebhookEventsInputField />
				</StepSection>
			</StepLayout>
		</Form>
	)
}
