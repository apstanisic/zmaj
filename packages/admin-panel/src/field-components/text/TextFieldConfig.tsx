import { ManualInputField } from "../../shared/input/ManualInputField"
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
			<ManualInputField source={prefix + "minLength"} label="Min Length" />
			<ManualInputField source={prefix + "maxLength"} label="Max Length" />
			<ManualInputField
				source={prefix + "regex"}
				label="Regular expression"
				description="Regex string, for example '^[a-z0-9]+$'"
			/>
			<ManualInputField
				source={prefix + "regexError"}
				label="Regular expression"
				description="What error to show if regex fails"
			/>
		</>
	)
}
