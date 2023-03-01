import { ManualInputField } from "../../shared/input/ManualInputField"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { NumberInputField } from "./NumberInputField"

export const NumberFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<ManualInputField
				Component={NumberInputField}
				source="fieldConfig.float.min"
				label="Min Number"
			/>
			<ManualInputField
				Component={NumberInputField}
				source="fieldConfig.float.max"
				label="Max Number"
			/>
		</>
	)
}

export const NumberFieldConfigShow = (): JSX.Element => {
	return (
		<>
			<ManualShowField source="fieldConfig.float.min" label="Min Number" />
			<ManualShowField source="fieldConfig.float.max" label="Max Number" />
		</>
	)
}
