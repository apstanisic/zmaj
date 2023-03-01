import { RelationCreateDto } from "@zmaj-js/common"
import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { DropdownInputField } from "../../../field-components/dropdown/DropdownInputField"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { throwInApp } from "../../../shared/throwInApp"
import { useGetCollection } from "../../../state/use-get-collection"
import { AdvancedOptions } from "./AdvancedOptions"
import { LeftColumnInput } from "./LeftColumnInput"
import { LeftPropertyInput } from "./LeftPropertyInput"
import { RightColumnInput } from "./RightColumnInput"
import { RightPropertyInput } from "./RightPropertyInput"

type RelationFormProps = {
	tables: string[]
}

export const RelationCreateForm = ({ tables }: RelationFormProps): JSX.Element => {
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })
	const leftTable = useWatch<RelationCreateDto, "leftTable">({ name: "leftTable" })
	const rightTable = useWatch<RelationCreateDto, "rightTable">({ name: "rightTable" })
	const leftCollection = useGetCollection(leftTable) ?? throwInApp("49327")
	const rightCollection = useGetCollection(rightTable) ?? throwInApp("907213")

	const { setValue } = useFormContext<RelationCreateDto>()

	const leftTableChoices = useMemo(
		() => tables.filter((t) => !t.startsWith("zmaj")).map((value) => ({ value })),
		[tables],
	)

	const rightTableChoices = useMemo(() => {
		return type === "one-to-many" || type === "ref-one-to-one"
			? tables.filter((t) => !t.startsWith("zmaj")).map((value) => ({ value }))
			: tables.map((value) => ({ value }))
	}, [tables, type])

	useEffect(() => {
		setValue("leftLabel", "")
		setValue("rightLabel", "")
		setValue("leftTemplate", "")
		setValue("rightTemplate", "")
		setValue("leftFkName", "")
		setValue("rightFkName", "")
		setValue("onDelete", "SET NULL")
		setValue("junctionLeftColumn", "")
		setValue("junctionRightColumn", "")
		setValue("junctionTable", "")

		if (rightTable.startsWith("zmaj") && (type === "one-to-many" || type === "ref-one-to-one")) {
			setValue("rightTable", rightTableChoices[0]?.value ?? "_")
		}
	}, [type, leftTable, rightTableChoices, setValue, rightTable])

	return (
		<div className="crud-content">
			<p className="mb-3 text-xl">Create Relation</p>

			<ManualInputField
				isRequired
				source="type"
				defaultValue="many-to-one"
				className="col-span-2"
				Component={DropdownInputField}
				fieldConfig={{
					component: {
						dropdown: {
							choices: [
								{ value: "many-to-one", label: ">-- Many to One" },
								{ value: "one-to-many", label: "--< One to Many " },
								{ value: "owner-one-to-one", label: "--- One to One (fk here)" },
								{ value: "ref-one-to-one", label: "--- One to One (fk in other table)" },
								{ value: "many-to-many", label: ">-< Many to Many" },
							],
						},
					},
				}}
			/>

			<div className="flex gap-x-3">
				<ManualInputField
					isRequired
					source="leftTable"
					label="Table"
					disabled
					Component={DropdownInputField}
					fieldConfig={{ component: { dropdown: { choices: leftTableChoices } } }}
				/>
				<ManualInputField
					isRequired
					source="rightTable"
					label="Table (other side)"
					disabled={rightTableChoices.length === 0}
					defaultValue={rightTableChoices[0]}
					Component={DropdownInputField}
					fieldConfig={{ component: { dropdown: { choices: rightTableChoices } } }}
				/>
			</div>

			<div className="flex gap-x-3">
				<LeftPropertyInput />
				<RightPropertyInput type={type} leftTable={leftTable} />
			</div>
			<div className="flex gap-x-3">
				<LeftColumnInput leftCollection={leftCollection} />
				<RightColumnInput rightCollection={rightCollection} />
			</div>
			<AdvancedOptions />
		</div>
	)
}
