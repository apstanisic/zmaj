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
export function LeftColumnInput({ leftCollection }: { leftCollection: CollectionDef }) {
	const { setValue } = useFormContext<RelationCreateDto>()
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })
	const rightCollection: string = useWatch<RelationCreateDto, "rightCollection">({
		name: "rightCollection",
	})

	const getDefaultValue = useCallback(() => {
		if (type === "one-to-many" || type === "many-to-many" || type === "ref-one-to-one") {
			return leftCollection.pkField
		} else {
			const defaultName = snakeCase(singular(rightCollection) + "Id")
			const free = !Object.values(leftCollection.fields).some(
				(f) => f.columnName === defaultName,
			)
			//.every((f) => f.columnName !== defaultName)
			return free ? defaultName : getFreeFkColumn(leftCollection, rightCollection)
		}
	}, [leftCollection, rightCollection, type])

	useEffect(() => {
		setValue("left.column", getDefaultValue())
	}, [type, setValue, leftCollection, getDefaultValue])

	return (
		<FormTextInput
			name="left.column"
			isDisabled={type !== "many-to-one" && type !== "owner-one-to-one"}
			label="Database Column"
			defaultValue={getDefaultValue()}
			isRequired
		/>
	)
}
