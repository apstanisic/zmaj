import {
	InputLayoutDefinition,
	LayoutDefinition,
	ListLayoutDefinition,
	ShowLayoutDefinition,
} from "./layout-definitions.types"

export function DefineCrudLayout(params: ShowLayoutDefinition): ShowLayoutDefinition
export function DefineCrudLayout(params: InputLayoutDefinition): InputLayoutDefinition
export function DefineCrudLayout(params: ListLayoutDefinition): ListLayoutDefinition
export function DefineCrudLayout(params: LayoutDefinition): LayoutDefinition {
	return params
}
