import { Struct } from "@common/types"
import { isNil } from "@common/utils/lodash"

export const quickFilterPrefix = "$:quick"

export function transformQuickFilter(allFilters: Struct): Struct | undefined {
	const firstKey = Object.keys(allFilters).find((key) => key.startsWith(quickFilterPrefix))
	if (!firstKey) return
	const value = allFilters[firstKey]
	const [base, filter = "$eq"] = firstKey.replace(quickFilterPrefix, "").split("__")
	return { [base!]: { [filter]: value } }
}

export function hasQuickFilter(allFilters?: Struct | null): allFilters is Struct {
	const key = Object.keys(allFilters ?? {}).find((key) => key.startsWith(quickFilterPrefix))
	if (!key) return false

	const val = allFilters![key]
	if (isNil(val) || val === "") return false

	return true
}
