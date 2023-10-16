import { FormNumberInput } from "@admin-panel/ui/Controlled"
import { ManualShowField } from "../../shared/show/ManualShowField"

export const NumberFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<FormNumberInput name="fieldConfig.float.min" label="Min Number" step={1} />
			<FormNumberInput name="fieldConfig.float.max" label="Max Number" step={1} />
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
