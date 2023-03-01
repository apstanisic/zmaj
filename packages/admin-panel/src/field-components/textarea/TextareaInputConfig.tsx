import { ManualInputField } from "@admin-panel/shared/input/ManualInputField"
import { IntInputField } from "../number-int/IntInputField"
import { createTextFieldConfigInput } from "../text/TextFieldConfig"

const CommonTextConfig = createTextFieldConfigInput("textarea")
export function TextareaConfigInput(): JSX.Element {
	return (
		<>
			<CommonTextConfig />
			<ManualInputField
				source="fieldConfig.component.textarea.rows"
				label="Rows"
				Component={IntInputField}
			/>
		</>
	)
}
