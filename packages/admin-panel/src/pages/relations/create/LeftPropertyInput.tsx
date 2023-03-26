import { RelationCreateDto } from "@zmaj-js/common"
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
	const { setValue } = useFormContext<RelationCreateDto>()
	const type = useWatch<RelationCreateDto, "type">({ name: "type", defaultValue: "many-to-one" })
	const rightCollection = useWatch<RelationCreateDto, "rightCollection">({
		name: "rightCollection",
		defaultValue: "zmaj_users",
	})

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
		setValue("left.propertyName", defaultPropertyName(rightCollection))
	}, [defaultPropertyName, rightCollection, setValue])

	return (
		<ManualInputField
			source="left.propertyName"
			label="Property"
			fieldConfig={shortTextDbColumnValidation}
			isRequired
		/>
	)
}
