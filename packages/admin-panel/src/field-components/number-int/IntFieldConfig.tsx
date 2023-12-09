import { FormNumberInput } from "@admin-panel/ui/Controlled"
import { ManualShowField } from "../../shared/show/ManualShowField"

export const IntFieldConfigInput = (): JSX.Element => {
	return (
		<>
			<FormNumberInput step={1} name="fieldConfig.int.min" label="Min number" />
			<FormNumberInput name="fieldConfig.int.max" label="Max number" step={1} />
			<FormNumberInput name="fieldConfig.int.step" label="Increment By" step={1} />
		</>
	)
}

export function IntFieldConfigShow() {
	return (
		<>
			<ManualShowField source="fieldConfig.int.min" label="Min number" />
			<ManualShowField source="fieldConfig.int.max" label="Max number" />
			<ManualShowField source="fieldConfig.int.step" label="Increment By" />
		</>
	)
}
