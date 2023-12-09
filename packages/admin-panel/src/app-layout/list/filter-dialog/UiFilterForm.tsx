import { FormSelectInput } from "@admin-panel/ui/Controlled"
import { AnyFn, FieldDef, ignoreErrors, joinFilters } from "@zmaj-js/common"
import { Form, useListContext } from "ra-core"
import { get } from "radash"
import { memo, useCallback, useEffect, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldContextProvider } from "../../../context/field-context"
import { fieldComponents } from "../../../field-components/field-components"
import { GuiComparison } from "../../../field-components/types/CrudComponentDefinition"
import { SingleFilter } from "../single-filter.type"
import { FilterSubmitButton } from "./FilterSubmitButton"
import { useFilterableFields } from "./use-filterable-fields"

const comparisonLabels: Record<GuiComparison, string> = {
	$eq: "equal",
	$gt: "greater than",
	$gte: "greater than or equal",
	$lt: "less than",
	$lte: "less than or equal",
	$in: "is in",
	$like: "is like (SQL LIKE OPERATOR)",
	$ne: "not equal",
	$nin: "not in",
	$exists: "exists",
	$not_exists: "does not exists",
}

const FormFields = memo((props: { filterableFields: FieldDef[] }) => {
	const { watch, setValue } = useFormContext()

	const fieldValue = watch("field")
	const comparisonValue = watch("comparison")

	const currentField = useMemo(
		() => props.filterableFields.find((f) => f.fieldName === fieldValue),
		[fieldValue, props.filterableFields],
	)

	// if invalid component, fallback to only eq and ne
	const Component = ignoreErrors(() =>
		fieldComponents.get(currentField?.componentName, currentField?.dataType),
	)
	// we can't modify component array
	const comparisons: GuiComparison[] = Component?.availableComparisons.concat() ?? ["$eq", "$ne"]

	// reset comparison and value on field name change
	useEffect(() => {
		setValue("comparison", "$eq")
		setValue("value", "")
	}, [fieldValue, setValue])

	return (
		<>
			<FormSelectInput
				name="field"
				label="Field"
				isRequired
				options={props.filterableFields.map((f) => ({
					value: f.fieldName,
					label: f.label ?? f.fieldName,
				}))}
			/>

			<FormSelectInput
				name="comparison"
				label="Comparison"
				isRequired
				options={comparisons.map((c) => ({
					value: c,
					label: comparisonLabels[c],
				}))}
			/>
			<FieldContextProvider value={currentField ?? ({} as any)}>
				<Controller
					name="value"
					disabled={
						Component === undefined ||
						["$exists", "$not_exists"].includes(comparisonValue)
					}
					render={({ field }) => {
						const ToRender = Component!.SmallInput
						return (
							<ToRender
								label="Value"
								source={field.name}
								disabled={field.disabled}
								value={field.value}
							/>
						)
					}}
				/>
			</FieldContextProvider>
		</>
	)
})

export function UiFilterForm(props: { hideDialog: AnyFn }) {
	const { filterValues, setFilters } = useListContext()

	const filterableFields = useFilterableFields()

	const addAdditionalFilter = useCallback(
		(values: SingleFilter) => {
			// sequelize does not support $exists, so we have to convert it to $eq
			const newFilter = ["$not_exists", "$exists"].includes(values.comparison)
				? { [values.field]: { [values.comparison === "$exists" ? "$eq" : "$ne"]: null } }
				: { [values.field]: { [values.comparison]: values.value } }
			const joined = joinFilters(filterValues, newFilter)

			// convert this filter to {$and: []}, so we can display values in gui
			const asArrayFilter = get(joined, "$and") ? joined : { $and: [joined] }
			setFilters(asArrayFilter, {})

			props.hideDialog()
		},
		[filterValues, props, setFilters],
	)

	return (
		<Form
			defaultValues={
				{
					field: filterableFields[0]?.fieldName ?? "id",
					comparison: "$eq",
					value: "",
				} as SingleFilter
			}
			onSubmit={(values) => addAdditionalFilter(values as SingleFilter)}
		>
			<FormFields filterableFields={filterableFields} />
			<FilterSubmitButton />
		</Form>
	)
}
