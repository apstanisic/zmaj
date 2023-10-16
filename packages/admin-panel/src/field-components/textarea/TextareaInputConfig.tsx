import { FormNumberInput } from "@admin-panel/ui/Controlled"
import { createTextFieldConfigInput } from "../text/TextFieldConfig"

const CommonTextConfig = createTextFieldConfigInput("textarea")
export function TextareaConfigInput(): JSX.Element {
	return (
		<>
			<CommonTextConfig />
			<FormNumberInput name="fieldConfig.component.textarea.rows" label="Rows" step={1} />
		</>
	)
}
