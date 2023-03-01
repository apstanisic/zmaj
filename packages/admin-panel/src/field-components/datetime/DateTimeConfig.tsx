import { useActionContext } from "../../context/action-context"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { BooleanInputField } from "../boolean/BooleanInputField"
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
		<ManualInputField
			Component={BooleanInputField}
			source="fieldConfig.component.dateTime.showRelative"
			defaultValue={false}
			label="Show Relative Date"
		/>
	)
}

export const DateTimeFieldConfigShow = (): JSX.Element => {
	return (
		<ManualShowField
			source="fieldConfig.component.dateTime.showRelative"
			Component={BooleanShowField}
			label="Show Relative Date In List"
			__fallbackValue={false}
		/>
	)
}
