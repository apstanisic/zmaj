import { FormTextInput } from "@admin-panel/ui/Controlled"
import { CollectionDef, RelationCreateDto, snakeCase } from "@zmaj-js/common"
import { singular } from "pluralize"
import { useCallback, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { getFreeFkColumn } from "./get-free-fk-column"

/**
 * Left column input
 * Field is disabled if other side has many,
 * because m2m and o2m always PK of left side, so we already know value
 * Default values is PK when it's required, {table}_id when it'll become FK
 */
export function RightColumnInput({
	rightCollection,
}: {
	rightCollection: CollectionDef
}): JSX.Element {
	const { setValue } = useFormContext<RelationCreateDto>()
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })
	const leftCollection: string = useWatch<RelationCreateDto, "leftCollection">({
		name: "leftCollection",
	})

	const getDefaultValue = useCallback(() => {
		// if o2m or m2m, pk must be used
		if (type === "many-to-one" || type === "many-to-many" || type === "owner-one-to-one") {
			return rightCollection.pkField
		} else {
			const defaultName = snakeCase(singular(leftCollection) + "Id")
			const free = !Object.values(rightCollection.fields).some(
				(f) => f.columnName === defaultName,
			)
			return free ? defaultName : getFreeFkColumn(rightCollection, leftCollection)
		}
	}, [leftCollection, rightCollection, type])

	useEffect(() => {
		setValue("right.column", getDefaultValue())
	}, [getDefaultValue, rightCollection, setValue, type])

	return (
		<FormTextInput
			name="right.column"
			isDisabled={type !== "one-to-many" && type !== "ref-one-to-one"}
			defaultValue={getDefaultValue()}
			label="Database Column (other side)"
			isRequired
		/>
	)
}
