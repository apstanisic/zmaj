import { useRelationContext } from "@admin-panel/context/relation-context"
import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { ManyToManyCreateField } from "@admin-panel/relation-components/many-to-many/ManyToManyCreateField"

export function GeneratedManyToManyCreateField() {
	const relation = useRelationContext()!
	const otherSide = useRelationRightSide()
	return (
		<ManyToManyCreateField
			label={relation.relation.label ?? relation.otherSide.collectionName}
			reference={relation.otherSide.collectionName}
			className={getFieldWidthCss(12)}
			template={relation.relation.template ?? otherSide?.displayTemplate ?? undefined}
			source={relation.propertyName}
		/>
	)
}
