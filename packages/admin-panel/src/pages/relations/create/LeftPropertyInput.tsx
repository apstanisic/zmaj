import { plural, singular } from "pluralize"
import { camel } from "radash"
import { useCallback, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { shortTextDbColumnValidation } from "../../../shared/db-column-form-validation"
import { ManualInputField } from "../../../shared/input/ManualInputField"

/**
 * Property name for left column
 */
export function LeftPropertyInput(): JSX.Element {
	const { setValue, watch } = useFormContext()
	const type = useWatch({ name: "type", defaultValue: "many-to-one" })
	const rightTable = useWatch({ name: "rightTable", defaultValue: "zmaj_users" })

	/**
	 * Convert table name to proper plurality
	 * If other side has many, it's plural, otherwise singular
	 */
	const defaultPropertyName = useCallback(
		(val = "property") => (type.endsWith("many") ? plural(camel(val)) : singular(camel(val))),
		[type],
	)

	// When other table and relation type change, generate new property name
	useEffect(() => {
		setValue("leftPropertyName", defaultPropertyName(rightTable))
	}, [rightTable, defaultPropertyName, setValue])

	return (
		<ManualInputField
			source="leftPropertyName"
			label="Property"
			fieldConfig={shortTextDbColumnValidation}
			isRequired
		/>
	)
}
