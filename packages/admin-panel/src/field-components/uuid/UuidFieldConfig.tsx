import { ManualInputField } from "../../shared/input/ManualInputField"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { DropdownInputField } from "../dropdown/DropdownInputField"

export const UuidFieldConfigInput = (): JSX.Element => {
	return (
		<ManualInputField
			Component={DropdownInputField}
			source="fieldConfig.component.uuid.version"
			label="UUID Version"
			fieldConfig={{
				component: {
					dropdown: { choices: [1, 2, 3, 4, 5].map((value) => ({ value })) },
				},
			}}
			isRequired={false}
		/>
	)
}

export const UuidFieldConfigShow = (): JSX.Element => {
	return <ManualShowField source="fieldConfig.component.uuid.version" label="UUID Version" />
}
