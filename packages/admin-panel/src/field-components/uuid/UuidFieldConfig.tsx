import { FormSelectInput } from "@admin-panel/ui/Controlled"
import { ManualShowField } from "../../shared/show/ManualShowField"

export const UuidFieldConfigInput = (): JSX.Element => {
	return (
		<FormSelectInput
			name="fieldConfig.component.uuid.version"
			label="UUID Version"
			options={[1, 2, 3, 4, 5].map((value) => ({ value }))}
		/>
	)
}

export const UuidFieldConfigShow = (): JSX.Element => {
	return <ManualShowField source="fieldConfig.component.uuid.version" label="UUID Version" />
}
