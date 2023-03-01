import { ignoreErrors, isNil } from "@zmaj-js/common"
import { Form, useListContext, useNotify } from "ra-core"
import { isObject } from "radash"
import { memo } from "react"
import { JsonInputField } from "../../../field-components/json/JsonInputField"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { FilterSubmitButton } from "./FilterSubmitButton"

export const JsonFilterForm = memo((props: { hideDialog: () => void }) => {
	const { setFilters, filterValues } = useListContext()
	const notify = useNotify()
	return (
		<Form
			id="filter-form"
			onSubmit={(v) => {
				// JsonInput returns object, so we only fallback to string
				const parsed = ignoreErrors(() =>
					isObject(v["filter"]) ? v["filter"] : JSON.parse(v["filter"] ?? "{}"),
				)
				// do not set filter if invalid
				if (isNil(parsed)) return notify("Invalid JSON", { type: "error" })

				setFilters(parsed ?? {}, {})
				props.hideDialog()
			}}
			defaultValues={{ filter: filterValues }}
		>
			<ManualInputField source="filter" Component={JsonInputField} />

			<FilterSubmitButton />
		</Form>
	)
})
