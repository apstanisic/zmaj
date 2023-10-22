import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { fieldComponents } from "../../../field-components/field-components"

export function FieldInfoInputDefaultValue(): JSX.Element {
	const { setValue, watch } = useFormContext()
	const componentName = useWatch({ name: "componentName" })
	const dataType = useWatch({ name: "dataType", defaultValue: "short-text" })

	useEffect(() => {
		setValue("dbDefaultValue", "")
	}, [dataType, componentName, setValue])

	const component = useMemo(() => {
		return fieldComponents.get(componentName, dataType)
	}, [dataType, componentName])
	const value = watch("dbDefaultValue")

	const Comp = component.name === "dropdown" ? fieldComponents.get().Input : component.Input
	console.log({ Comp })

	if (1) return <></>
	return (
		<Comp
			value={value}
			source="dbDefaultValue"
			label="Default Value"
			description="Leave empty for null"
			defaultValue=""
		/>
	)
}
