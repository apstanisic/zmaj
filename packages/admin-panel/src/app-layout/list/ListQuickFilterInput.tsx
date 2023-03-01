import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { TextInput } from "@admin-panel/ui/TextInput"
import { quickFilterPrefix } from "@zmaj-js/common"
import { useListContext, useListFilterContext } from "ra-core"
import { debounce } from "radash"
import { memo, useMemo, useState } from "react"

const BaseQuickFilterInput = memo(({ field, disabled }: { field: string; disabled?: boolean }) => {
	const { setFilters, filterValues } = useListFilterContext()
	// we have to have this value to show, so we can debounce filter
	const [value, setValue] = useState(filterValues[field] ?? "")

	const setFilterDebounced = useMemo(
		() =>
			debounce({ delay: 300 }, (newVal: string) => {
				setFilters(newVal === "" ? {} : { [field]: newVal }, [])
			}),
		[field, setFilters],
	)

	//
	return (
		<div className="w-full sm:max-w-sm">
			<TextInput
				isDisabled={disabled}
				placeholder="Quick Search"
				name={field}
				value={value}
				aria-label="Quick Search"
				onChange={(val) => {
					setValue(val)
					setFilterDebounced(val)
				}}
			/>
		</div>
	)
})

export function ListQuickFilterInput(): JSX.Element {
	const selected = useListContext().selectedIds

	const config = useLayoutConfigContext().list
	const { quickFilter, disableFilter } = config

	if (quickFilter === false || disableFilter) return <></>

	const quickFilterKey = `${quickFilterPrefix}${quickFilter}`

	return <BaseQuickFilterInput field={quickFilterKey} disabled={selected.length > 0} />
}
