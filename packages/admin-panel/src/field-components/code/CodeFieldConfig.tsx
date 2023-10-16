import { FormSelectInput } from "@admin-panel/ui/Controlled"
import { Highlight } from "@admin-panel/ui/forms/CodeInput/highlight.lib"
import { ManualShowField } from "../../shared/show/ManualShowField"

export const CodeFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<FormSelectInput
				name="fieldConfig.component.code.syntaxLanguage"
				label="Language"
				options={Highlight.listLanguages().map((lang) => ({ value: lang }))}
			/>
		</>
	)
}

export const CodeFieldConfigShow = (): JSX.Element => {
	return (
		<>
			<ManualShowField
				source="fieldConfig.component.code.syntaxLanguage"
				label="Min Number"
			/>
		</>
	)
}
