import { Chip } from "@admin-panel/ui/Chip"
import { getFirstProperty, isNil, isStruct, quickFilterPrefix, Struct } from "@zmaj-js/common"
import { clsx } from "clsx"
import { deepClone } from "fast-json-patch"
import { useListContext } from "ra-core"
import { get, isEmpty } from "radash"
import { memo } from "react"

type GuiFilter = {
	$and?: Struct[] //
	[key: string]: unknown
}

const toFlatFilter = (val: any): false | [field: string, comp: string, value: any] => {
	if (!isStruct(val)) return false

	const level1 = getFirstProperty(val)
	if (level1 === undefined) return false

	const [field, compAndValue] = level1
	if (field === "$or" || field === "$an") return false
	if (!isStruct(compAndValue)) return [field, "$eq", val]

	const level2 = getFirstProperty(compAndValue)
	if (level2 === undefined) return false

	const [comp, value] = level2
	return [field, comp, value]
}

/**
 * Currently active filters
 *
 * It's a list of chips (rounded rectangles), and each chip contains one applied filter
 */
export const CurrentlyActiveFilters = memo(() => {
	const { filterValues, setFilters } = useListContext()

	// if there is a field that starts with quick filter prefix it's quick filter
	const quickFilterActive = Object.keys(filterValues).find((key) =>
		key.startsWith(quickFilterPrefix),
	)

	const emptyDiv = <div className={clsx("h-0 w-full")}></div>

	if (quickFilterActive) return emptyDiv
	if (isNil(filterValues) || isEmpty(filterValues)) return emptyDiv

	const arrayFilter = get(filterValues, "$and")
	if (!Array.isArray(arrayFilter)) {
		return (
			<Chip
				outline
				text="Custom Filter"
				// color="secondary"
				variant="primary"

				// className="my-0"
				// size="small"
			/>
		)
	}
	// Make it transparent if quick filter is active, since quick filter removes normal filters
	// we don't want to remove space since then ui will jump
	return (
		<div
			className={clsx("flex flex-wrap items-center gap-2 py-2", quickFilterActive && "opacity-0")}
		>
			{arrayFilter.map((filter, i) => {
				const flat = toFlatFilter(filter)
				return (
					<Chip
						variant="primary"
						outline
						key={i.toString()}
						// color="secondary"
						// variant="outlined"
						// className="my-0"
						// size="small"
						text={
							<span>
								{flat === false ? (
									<>Custom Filter</>
								) : (
									<>
										<b>{flat[0]}&nbsp;</b>
										{flat[1]}
										<b>&nbsp;{JSON.stringify(flat[2])}</b>
									</>
								)}
							</span>
						}
						onClose={() => setFilters(removeSingleFilter(filterValues, i), [])}
					/>
				)
			})}
		</div>
	)
})

function removeSingleFilter(filter: Struct, i: number): GuiFilter {
	const cloned = deepClone(filter)
	if (Array.isArray(cloned.$and)) {
		cloned.$and.splice(i, 1)
	}
	return cloned
}
