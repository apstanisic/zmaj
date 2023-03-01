import { IdType, ToManyChange } from "@zmaj-js/common"
import { toggle, unique } from "radash"

function addItems(data: ToManyChange, type: "added" | "removed", ids: IdType[]): ToManyChange {
	const cloned = structuredClone(data)
	cloned[type].push(...ids)
	cloned[type] = unique(cloned[type])
	return cloned
}

function emptyItems(data: ToManyChange, type: "added" | "removed"): ToManyChange {
	const cloned = structuredClone(data)
	cloned[type] = []
	return cloned
}
function removeItems({
	data,
	ids,
	type,
}: {
	data: ToManyChange
	ids: IdType[]
	type: "added" | "removed"
}): ToManyChange {
	const cloned = structuredClone(data)
	cloned[type] = cloned[type].filter((id) => !ids.includes(id))
	return cloned
}

function toggleItem(data: ToManyChange, type: "added" | "removed", id: IdType): ToManyChange {
	const cloned = structuredClone(data)
	cloned[type] = toggle(cloned[type], id)
	return cloned
}

/**
 * @deprecated
 */
export const idActions = { emptyItems, removeItems, toggleItem, addItems }
