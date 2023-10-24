import { useFieldContext } from "@admin-panel/context/field-context"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { useRecord } from "@admin-panel/hooks/use-record"
import { throwInApp } from "@admin-panel/shared/throwInApp"
import { FieldDef, RelationDef } from "@zmaj-js/common"
import { RaRecord } from "ra-core"
import { title } from "radash"

type UseManyToOneFieldPropsResult = {
	label: string
	template: string
	mainRecord?: RaRecord
	field: FieldDef
	relation: RelationDef
}

export function useManyToOneFieldProps(): UseManyToOneFieldPropsResult {
	const relation = useRelationContext() ?? throwInApp("10400")
	const field = useFieldContext() ?? throwInApp("380123")
	const rightSide = useRelationRightSide()

	const record = useRecord()

	const label = relation.relation.label ?? title(relation.propertyName)

	// We need template for table we are referencing, since we are showing that table data
	// use relation template, but fall back to other collection template if not provided
	const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"

	const shared = {
		label,
		template,
		field,
		relation,
		mainRecord: record,
	}
	return shared
}
