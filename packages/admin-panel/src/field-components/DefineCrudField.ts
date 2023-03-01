import { unique } from "radash"
import { DefaultListField } from "../shared/list/DefaultLIstField"
import { DefaultShowField } from "../shared/show/DefaultShowField"
import { AddFieldComponentParams } from "./field-components"
import { CrudComponentDefinition } from "./types/CrudComponentDefinition"

export function DefineCrudField(component: AddFieldComponentParams): CrudComponentDefinition {
	const availableFor = unique(component.availableFor)

	return {
		...component,
		name: component.name,
		Input: component.Input,
		// It's common to use this components
		Show: component.Show ?? DefaultShowField,
		List: component.List ?? DefaultListField,
		SmallInput: component.SmallInput ?? component.Input,
		availableFor,
		availableComparisons: component.availableComparisons ?? [
			"$eq",
			"$ne",
			"$exists",
			"$not_exists",
		],
	}
}
