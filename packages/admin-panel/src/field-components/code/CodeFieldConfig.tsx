import { ManualInputField } from "../../shared/input/ManualInputField"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { DropdownInputField } from "../dropdown/DropdownInputField"
import { Highlight } from "./highlight"

export const CodeFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<ManualInputField
				Component={DropdownInputField}
				source="fieldConfig.component.code.syntaxLanguage"
				label="Language"
				fieldConfig={{
					component: {
						dropdown: { choices: Highlight.listLanguages().map((lang) => ({ value: lang })) },
					},
				}}
			/>
		</>
	)
}

export const CodeFieldConfigShow = (): JSX.Element => {
	return (
		<>
			<ManualShowField source="fieldConfig.component.code.syntaxLanguage" label="Min Number" />
		</>
	)
}
