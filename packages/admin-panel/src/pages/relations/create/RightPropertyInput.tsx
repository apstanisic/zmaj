import { FormTextInput } from "@admin-panel/ui/Controlled"
import { RelationCreateDto } from "@zmaj-js/common"
import { plural, singular } from "pluralize"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

/**
 * Property name for right column
 */
export function RightPropertyInput(
	props: Pick<RelationCreateDto, "type" | "leftCollection">,
): JSX.Element {
	const { leftCollection, type } = props
	const { setValue } = useFormContext<RelationCreateDto>()
	// When other table and relation type change, generate new property name

	useEffect(() => {
		setValue(
			"right.propertyName",
			type.endsWith("many") ? plural(leftCollection) : singular(leftCollection), //
		)
	}, [leftCollection, setValue, type])

	return <FormTextInput name="right.propertyName" label="Property (other side)" isRequired />
}
