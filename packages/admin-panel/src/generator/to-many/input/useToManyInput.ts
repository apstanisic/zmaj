import { IdType, ToManyChange } from "@zmaj-js/common"
import { useInput } from "ra-core"
import { toggle as toggleFn, unique } from "radash"
import { useCallback } from "react"
import { useRelationContext } from "../../../context/relation-context"
import { throwInApp } from "../../../shared/throwInApp"

type UseToManyInputResult = [value: ToManyChange, setValue: (ch: ToManyChange) => unknown]
export type UseToManyInputResult2 = {
	value: ToManyChange
	setValue: (ch: ToManyChange) => unknown //
	add: (type: "added" | "removed", ids: IdType[]) => void
	remove: (type: "added" | "removed", ids: IdType[]) => void
	toggle: (type: "added" | "removed", ids: IdType) => void
}

const getEmpty = (): ToManyChange => ({ type: "toMany", added: [], removed: [] })

export function useToManyInput(): UseToManyInputResult2 {
	const relation = useRelationContext() ?? throwInApp("19792")

	const input = useInput({
		source: relation.propertyName,
		defaultValue: getEmpty(),
	})

	const changeValue = useCallback(
		(data: ToManyChange) => input.field.onChange({ target: { value: data } }),
		[input.field],
	)

	const add = useCallback(
		(type: "added" | "removed", ids: IdType[]) => {
			const cloned = structuredClone<ToManyChange>(input.field.value)
			cloned[type] = unique([...cloned[type], ...ids])
			changeValue(cloned)
		},
		[changeValue, input.field.value],
	)

	const toggle = useCallback(
		(type: "added" | "removed", id: IdType) => {
			const cloned = structuredClone<ToManyChange>(input.field.value)
			cloned[type] = toggleFn(cloned[type], id)
			changeValue(cloned)
		},
		[changeValue, input.field.value],
	)

	const remove = useCallback(
		(type: "added" | "removed", ids: IdType[]) => {
			const cloned = structuredClone<ToManyChange>(input.field.value)
			cloned[type] = cloned[type].filter((v) => !ids.includes(v))
			changeValue(cloned)
		},
		[changeValue, input.field.value],
	)

	return { value: input.field.value, setValue: changeValue, add, toggle, remove }
	// return [input.field.value, changeValue]
}

export function useToManyInput2(): UseToManyInputResult {
	const relation = useRelationContext() ?? throwInApp("19792")

	const input = useInput({
		source: relation.propertyName,
		defaultValue: getEmpty(),
	})

	const changeValue = useCallback(
		(data: ToManyChange) => input.field.onChange({ target: { value: data } }),
		[input.field],
	)
	return [input.field.value, changeValue]
}
