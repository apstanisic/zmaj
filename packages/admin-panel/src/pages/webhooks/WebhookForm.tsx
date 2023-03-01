import { Form } from "ra-core"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { BooleanInputField } from "../../field-components/boolean/BooleanInputField"
import { DropdownInputField } from "../../field-components/dropdown/DropdownInputField"
import { KeyValueInputField } from "../../field-components/key-value/KeyValueInputField"
import { TextareaInputField } from "../../field-components/textarea/TextareaInputField"
import { UrlInputField } from "../../field-components/url/UrlInputField"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { WebhookEventsInputField } from "./WebhookEventsInputField"

export function WebhookForm(): JSX.Element {
	return (
		<Form>
			<StepLayout sections={["Info", "Events"]}>
				<StepSection index={0}>
					<ManualInputField source="name" />
					<ManualInputField
						source="httpMethod"
						Component={DropdownInputField}
						isRequired
						defaultValue="GET"
						fieldConfig={{
							component: {
								dropdown: {
									choices: ["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => ({ value })),
								},
							},
						}}
					/>
					<ManualInputField source="description" Component={TextareaInputField} />
					<ManualInputField source="enabled" Component={BooleanInputField} defaultValue={false} />
					<ManualInputField source="sendData" Component={BooleanInputField} defaultValue={false} />
					<ManualInputField source="url" Component={UrlInputField} isRequired />
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
