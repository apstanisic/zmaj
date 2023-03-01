import { CollectionDef, RelationCreateDto } from "@zmaj-js/common"
import { singular } from "pluralize"
import { camel } from "radash"
import { useCallback, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { shortTextDbColumnValidation } from "../../../shared/db-column-form-validation"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { getFreeFkColumn } from "./get-free-fk-column"

/**
 * Left column input
 * Field is disabled if other side has many,
 * because m2m and o2m always PK of left side, so we already know value
 * Default values is PK when it's required, {table}_id when it'll become FK
 */
export function LeftColumnInput({
	leftCollection,
}: {
	leftCollection: CollectionDef
}): JSX.Element {
	const { setValue } = useFormContext<RelationCreateDto>()
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })
	const rightTable: string = useWatch<RelationCreateDto, "rightTable">({ name: "rightTable" })

	const getDefaultValue = useCallback(() => {
		if (type === "one-to-many" || type === "many-to-many" || type === "ref-one-to-one") {
			return leftCollection.pkField
		} else {
			const defaultName = singular(rightTable + "_id")
			const free = leftCollection.fields[camel(defaultName)] === undefined
			//.every((f) => f.columnName !== defaultName)
			return free ? defaultName : getFreeFkColumn(leftCollection, rightTable)
		}
	}, [leftCollection, rightTable, type])

	useEffect(() => {
		setValue("leftColumn", getDefaultValue())
	}, [type, rightTable, setValue, leftCollection, getDefaultValue])

	return (
		<ManualInputField
			source="leftColumn"
			disabled={type !== "many-to-one" && type !== "owner-one-to-one"}
			label="Database Column"
			defaultValue={getDefaultValue()}
			isRequired
			fieldConfig={shortTextDbColumnValidation}
		/>
	)
}
