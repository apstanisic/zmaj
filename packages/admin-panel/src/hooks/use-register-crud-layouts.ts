import { useEffect } from "react"
import {
	InputLayoutDefinition,
	ListLayoutDefinition,
	ShowLayoutDefinition,
} from "../crud-layouts/layout-definitions.types"
import { crudLayouts } from "../crud-layouts/layouts"

export type UseRegisterCrudLayoutParams = {
	list?: ListLayoutDefinition[]
	show?: ShowLayoutDefinition[]
	input?: InputLayoutDefinition[]
	defaultListLayout?: string
	defaultShowLayout?: string
	defaultInputLayout?: string
}

/**
 *  This hook is used for registering app layouts
 *  TODO This does not need to be a hook
 */
export function useRegisterCrudLayout(params: UseRegisterCrudLayoutParams = {}): void {
	useEffect(() => {
		// add list layouts
		for (const layout of params.list ?? []) {
			crudLayouts.addList(layout)
		}

		// add input layouts
		for (const layout of params.input ?? []) {
			crudLayouts.addInput(layout)
		}

		// add show layouts
		for (const layout of params.show ?? []) {
			crudLayouts.addShow(layout)
		}

		if (params.defaultShowLayout) crudLayouts.setLayout("show", params.defaultShowLayout)
		if (params.defaultInputLayout) crudLayouts.setLayout("input", params.defaultInputLayout)
		if (params.defaultListLayout) crudLayouts.setLayout("list", params.defaultListLayout)
	}, [params])
}
