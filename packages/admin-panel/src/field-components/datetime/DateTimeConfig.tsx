import { FormSwitchInput } from "@admin-panel/ui/Controlled"
import { useActionContext } from "../../context/action-context"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { BooleanShowField } from "../boolean/BooleanShowField"

export const DateTimeFieldConfigInput = (): JSX.Element => {
	const action = useActionContext()
	if (action === "list") return <></>
	if (action === "show") {
		return (
			<ManualShowField
				source="fieldConfig.component.dateTime.showRelative"
				label="Show Relative Date"
			/>
		)
	}
	return (
		<FormSwitchInput
			name="fieldConfig.component.dateTime.showRelative"
			label="Show Relative Date"
			defaultValue={false}
		/>
	)
}

export const DateTimeFieldConfigShow = (): JSX.Element => {
	return (
		<ManualShowField
			source="fieldConfig.component.dateTime.showRelative"
			Component={BooleanShowField}
			label="Show Relative Date In List"
		/>
	)
}
