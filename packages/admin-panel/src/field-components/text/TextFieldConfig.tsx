import { FormTextInput } from "@admin-panel/ui/Controlled"
import { ManualShowField } from "../../shared/show/ManualShowField"

export function createTextFieldConfigShow(componentName: string): () => JSX.Element {
	const prefix = `fieldConfig.component.${componentName}.`
	return () => (
		<>
			<ManualShowField source={prefix + "minLength"} label="Min Length" />
			<ManualShowField source={prefix + "maxLength"} label="Max Length" />
			<ManualShowField
				source={prefix + "regex"}
				label="Regular expression"
				description="Regex string, for example '^[a-z0-9]+$'"
			/>
		</>
	)
}

export function createTextFieldConfigInput(componentName: string): () => JSX.Element {
	const prefix = `fieldConfig.component.${componentName}.`
	return () => (
		<>
			<FormTextInput name={prefix + "minLength"} label="Min Length" />
			<FormTextInput name={prefix + "maxLength"} label="Max Length" />
			<FormTextInput
				name={prefix + "regex"}
				label="Regular expression"
				description="Regex string, for example '^[a-z0-9]+$'"
			/>
			<FormTextInput
				name={prefix + "regexError"}
				label="Regular expression"
				description="What error to show if regex fails"
			/>
		</>
	)
}
