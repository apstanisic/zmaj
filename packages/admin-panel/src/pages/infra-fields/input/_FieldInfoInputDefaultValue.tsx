import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useActionContext } from "../../../context/action-context"
import { fieldComponents } from "../../../field-components/field-components"
import { ManualInputField } from "../../../shared/input/ManualInputField"

export function FieldInfoInputDefaultValue(): JSX.Element {
	const { setValue } = useFormContext()
	const componentName = useWatch({ name: "componentName" })
	const dataType = useWatch({ name: "dataType", defaultValue: "short-text" })
	const action = useActionContext()

	useEffect(() => {
		setValue("dbDefaultValue", "")
	}, [dataType, componentName, setValue])

	const component = useMemo(() => {
		return fieldComponents.get(componentName, dataType)
	}, [dataType, componentName])

	return (
		<ManualInputField
			source="dbDefaultValue"
			label="Default Value"
			description="Leave empty for null"
			disabled={action === "edit"}
			defaultValue=""
			Component={component.name === "dropdown" ? fieldComponents.get().Input : component.Input}
		/>
	)
}
