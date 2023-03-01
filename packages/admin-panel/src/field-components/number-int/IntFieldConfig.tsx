import { ManualInputField } from "../../shared/input/ManualInputField"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { IntInputField } from "./IntInputField"

export const IntFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<ManualInputField source="fieldConfig.int.min" label="Min number" Component={IntInputField} />
			<ManualInputField source="fieldConfig.int.max" label="Max number" Component={IntInputField} />
			<ManualInputField
				Component={IntInputField}
				source="fieldConfig.int.step"
				label="Increment By"
			/>
		</>
	)
}

export function IntFieldConfigShow(): JSX.Element {
	return (
		<>
			<ManualShowField source="fieldConfig.int.min" label="Min number" />
			<ManualShowField source="fieldConfig.int.max" label="Max number" />
			<ManualShowField source="fieldConfig.int.step" label="Increment By" />
		</>
	)
}
