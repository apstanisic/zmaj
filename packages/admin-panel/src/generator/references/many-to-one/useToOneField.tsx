import { useFieldContext } from "@admin-panel/context/field-context"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { ToOneInternalProps } from "@admin-panel/generator/many-to-one/ToOneInternalProps.type"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { useRecord } from "@admin-panel/hooks/use-record"
import { throwInApp } from "@admin-panel/shared/throwInApp"
import { title } from "radash"

export function useToOneField() {
	const relation = useRelationContext() ?? throwInApp("10400")
	const field = useFieldContext() ?? throwInApp("380123")
	const rightSide = useRelationRightSide()

	const record = useRecord()

	const label = relation.relation.label ?? title(relation.propertyName)

	// We need template for table we are referencing, since we are showing that table data
	// use relation template, but fall back to other collection template if not provided
	const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"

	const shared: ToOneInternalProps = {
		label,
		template,
		field,
		relation,
		mainRecord: record,
	}
	return shared
}
