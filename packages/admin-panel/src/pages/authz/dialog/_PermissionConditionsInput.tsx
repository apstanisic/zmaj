import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { JsonInputField } from "../../../field-components/json/JsonInputField"
import { ManualInputField } from "../../../shared/input/ManualInputField"

export function PermissionConditionsInput(): JSX.Element {
	return (
		<TabsSection>
			<ManualInputField
				Component={JsonInputField}
				// fieldConfig={{ textarea: { rows: 12 } }}
				source="conditions"
			/>
		</TabsSection>
	)
}
