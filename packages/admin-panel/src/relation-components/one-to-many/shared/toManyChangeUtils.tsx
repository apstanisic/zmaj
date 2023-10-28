import { ToManyChange } from "@zmaj-js/common"
import { Identifier } from "ra-core"
import { toggle, unique } from "radash"

export const toManyChangeUtils = {
	add: (data: any, type: "added" | "removed", id: Identifier) => {
		const clone = structuredClone(data) as ToManyChange
		clone[type] = unique([...clone[type], id])
		return clone
	},
	remove: (data: any, type: "added" | "removed", id: Identifier) => {
		const clone = structuredClone(data) as ToManyChange
		clone[type] = clone[type].filter((itemId) => itemId !== id)
		return clone
	},
	toggle: (data: any, type: "added" | "removed", id: Identifier) => {
		const clone = structuredClone(data) as ToManyChange
		clone[type] = toggle(clone[type], id)
		return clone
	},
}
