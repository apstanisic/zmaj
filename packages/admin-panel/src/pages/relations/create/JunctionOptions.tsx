import { FieldConfig } from "@zmaj-js/common"
import { dbColumnValidation } from "../../../shared/db-column-form-validation"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { Columns } from "../../../ui/Columns"

export function JunctionOptions(): JSX.Element {
	const description = "Leave empty for default value"
	const fieldConfig: FieldConfig = { component: { "short-text": dbColumnValidation } }
	return (
		<Columns>
			<ManualInputField
				source="junctionLeftColumn"
				label="Junction Field"
				description={description}
				fieldConfig={fieldConfig}
			/>
			<ManualInputField
				source="junctionTable"
				label="Junction Table"
				description={description}
				fieldConfig={fieldConfig}
			/>
			<ManualInputField
				source="junctionRightColumn"
				label="Junction Field"
				description={description}
				fieldConfig={fieldConfig}
			/>
		</Columns>
	)
}
