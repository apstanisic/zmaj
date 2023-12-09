import { FormSelectInput } from "@admin-panel/ui/Controlled"
import { RelationCreateDto } from "@zmaj-js/common"
import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { throwInApp } from "../../../shared/throwInApp"
import { useGetCollection } from "../../../state/use-get-collection"
import { AdvancedOptions } from "./AdvancedOptions"
import { LeftColumnInput } from "./LeftColumnInput"
import { LeftPropertyInput } from "./LeftPropertyInput"
import { RightColumnInput } from "./RightColumnInput"
import { RightPropertyInput } from "./RightPropertyInput"

type RelationFormProps = {
	collections: string[]
}

export const RelationCreateForm = ({ collections }: RelationFormProps): JSX.Element => {
	const type = useWatch<RelationCreateDto, "type">({ name: "type" })
	const leftCollectionName = useWatch<RelationCreateDto, "leftCollection">({
		name: "leftCollection",
	})
	const rightCollectionName = useWatch<RelationCreateDto, "rightCollection">({
		name: "rightCollection",
	})
	const leftCollection = useGetCollection(leftCollectionName) ?? throwInApp("49327")

	const rightCollection = useGetCollection(rightCollectionName) //?? throwInApp("907213")

	const { setValue } = useFormContext<RelationCreateDto>()

	const leftTableChoices = useMemo(
		() => collections.filter((t) => !t.startsWith("zmaj")).map((value) => ({ value })),
		[collections],
	)

	const rightTableChoices = useMemo(() => {
		return type === "one-to-many" || type === "ref-one-to-one"
			? collections.filter((t) => !t.startsWith("zmaj")).map((value) => ({ value }))
			: collections.map((value) => ({ value }))
	}, [collections, type])

	useEffect(() => {
		setValue("left.label", "")
		setValue("right.label", "")
		setValue("left.template", "")
		setValue("right.template", "")
		setValue("fkName", "")
		setValue("junction.fkName", "")
		setValue("onDelete", "SET NULL")
		setValue("junction.left.column", "")
		setValue("junction.right.column", "")
		setValue("junction.tableName", "")

		if (
			rightCollectionName.startsWith("zmaj") &&
			(type === "one-to-many" || type === "ref-one-to-one")
		) {
			setValue("rightCollection", rightTableChoices[0]?.value ?? "_")
		}
	}, [type, leftCollectionName, rightTableChoices, setValue, rightCollectionName])

	return (
		<div className="crud-content">
			<p className="mb-3 text-xl">Create Relation</p>

			<FormSelectInput
				isRequired
				name="type"
				defaultValue="many-to-one"
				className="col-span-2"
				aria-label="Relation type"
				options={[
					{ value: "many-to-one", label: ">-- Many to One" },
					{ value: "one-to-many", label: "--< One to Many " },
					{ value: "owner-one-to-one", label: "--- One to One (fk here)" },
					{ value: "ref-one-to-one", label: "--- One to One (fk in other table)" },
					{ value: "many-to-many", label: ">-< Many to Many" },
				]}
			/>

			<div className="flex gap-x-3">
				<FormSelectInput
					isRequired
					name="leftCollection"
					label="Collection"
					isDisabled
					options={leftTableChoices}
				/>
				<FormSelectInput
					isRequired
					name="rightCollection"
					label="Collection (other side)"
					isDisabled={rightTableChoices.length === 0}
					defaultValue={rightTableChoices[0]?.value}
					options={rightTableChoices}
				/>
			</div>

			<div className="flex gap-x-3">
				<LeftPropertyInput />
				<RightPropertyInput type={type} leftCollection={leftCollectionName} />
			</div>
			<div className="flex gap-x-3">
				<LeftColumnInput leftCollection={leftCollection} />
				<RightColumnInput rightCollection={rightCollection} />
			</div>
			<AdvancedOptions />
		</div>
	)
}
