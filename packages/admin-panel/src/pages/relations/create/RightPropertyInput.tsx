import { RelationCreateDto } from "@zmaj-js/common"
import { plural, singular } from "pluralize"
import { camel } from "radash"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { shortTextDbColumnValidation } from "../../../shared/db-column-form-validation"
import { ManualInputField } from "../../../shared/input/ManualInputField"

/**
 * Property name for right column
 */
export function RightPropertyInput(
	props: Pick<RelationCreateDto, "type" | "leftTable">,
): JSX.Element {
	const { leftTable, type } = props
	const { setValue } = useFormContext<RelationCreateDto>()
	// When other table and relation type change, generate new property name

	useEffect(() => {
		setValue(
			"rightPropertyName",
			type.endsWith("many") ? plural(camel(leftTable)) : singular(camel(leftTable)), //
		)
	}, [leftTable, setValue, type])

	return (
		<ManualInputField
			source="rightPropertyName"
			label="Property (other side)"
			fieldConfig={shortTextDbColumnValidation}
			isRequired
		/>
	)
}
