import { CollectionDef, RelationCreateDto } from "@zmaj-js/common"
import { singular } from "pluralize"
import { camel } from "radash"
import { useCallback, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { ManualInputField } from "../../../shared/input/ManualInputField"
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
	const leftTable: string = useWatch<RelationCreateDto, "leftTable">({ name: "leftTable" })

	const getDefaultValue = useCallback(() => {
		// if o2m or m2m, pk must be used
		if (type === "many-to-one" || type === "many-to-many" || type === "owner-one-to-one") {
			return rightCollection.pkField
		} else {
			const defaultName = singular(leftTable + "_id")
			const free = rightCollection.fields[camel(defaultName)] === undefined
			return free ? defaultName : getFreeFkColumn(rightCollection, leftTable)
		}
	}, [leftTable, rightCollection, type])

	useEffect(() => {
		setValue("rightColumn", getDefaultValue())
	}, [getDefaultValue, leftTable, rightCollection, setValue, type])

	return (
		<ManualInputField
			source="rightColumn"
			disabled={type !== "one-to-many" && type !== "ref-one-to-one"}
			defaultValue={getDefaultValue()}
			label="Database Column (other side)"
			isRequired
		/>
	)
}
