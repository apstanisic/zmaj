import { useRecord } from "@admin-panel/hooks/use-record"
import { FormSelectInput } from "@admin-panel/ui/Controlled"
import { FieldDef } from "@zmaj-js/common"
import { memo, useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { fieldComponents } from "../../../field-components/field-components"

// wait react hook form
export const FieldInfoInputComponentName = memo(() => {
	const { setValue, getValues } = useFormContext()
	const startValues = useRecord<FieldDef>()
	const dataType = useWatch({ name: "dataType" })
	const componentName = useWatch({ name: "componentName" })

	const availableComponents = useMemo(() => fieldComponents.getByDbType(dataType), [dataType])

	const defVal = useMemo(() => {
		return availableComponents.includes(dataType) ? dataType : availableComponents[0] ?? ""
		//
	}, [availableComponents, dataType])
	/**
	 * This ensures that only available component are in dropdown
	 */
	useEffect(() => {
		if (availableComponents.includes(componentName)) return
		// if there is component named same as data type use it
		const newValue = availableComponents.includes(dataType)
			? dataType
			: availableComponents[0] ?? ""

		setValue("componentName", newValue)
	}, [availableComponents, componentName, dataType, setValue])

	return (
		<FormSelectInput
			name="componentName"
			label="Component name"
			isRequired
			defaultValue=""
			options={availableComponents.map((c) => ({ value: c, label: c }))}
			// fromInput={(value) => {
			// 	// If it's the same component as in start, we will restore old value
			// 	// it prevents problem when users changes components and returns to already existing
			// 	// We don't care if it's edit or create since create won't have value
			// 	if (startValues?.componentName === value) {
			// 		setValue("fieldConfig", startValues?.fieldConfig ?? {})
			// 	} else {
			// 		setValue("fieldConfig", {})
			// 	}
			// }}
		/>
	)
})
