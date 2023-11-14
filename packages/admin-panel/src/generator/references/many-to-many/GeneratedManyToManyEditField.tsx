import { useRelationContext } from "@admin-panel/context/relation-context"
import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { ManyToManyEditField } from "@admin-panel/relation-components/many-to-many/ManyToManyEditField"

export function GeneratedManyToManyEditField() {
	const relation = useRelationContext()!
	const otherSide = useRelationRightSide()
	return (
		<ManyToManyEditField
			label={relation.relation.label ?? relation.otherSide.collectionName}
			reference={relation.otherSide.collectionName}
			troughSource={relation.junction!.thisSide.fieldName}
			troughTarget={relation.junction!.otherSide.fieldName}
			trough={relation.junction!.collectionName}
			source={relation.propertyName}
			target="id"
			className={getFieldWidthCss(12)}
			template={relation.relation.template ?? otherSide?.displayTemplate ?? undefined}
		/>
	)
}
