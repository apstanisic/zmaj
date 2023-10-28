import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useRelationRightSide } from "@admin-panel/generator/use-relation-right-side"
import { OneToManyEditField } from "@admin-panel/relation-components/one-to-many/edit/OneToManyEditField"
import { useOneToManyFieldProps } from "./useOneToManyFieldProps"

export function GeneratedOneToManyEditField() {
	const { template, label, relation } = useOneToManyFieldProps()
	const rightSide = useRelationRightSide()

	return (
		<OneToManyEditField
			label={label}
			template={template}
			reference={relation.otherSide.collectionName}
			target={relation.otherSide.fieldName}
			className={getFieldWidthCss(12)}
			source={relation.propertyName}
			fkNullable={rightSide?.fields[relation.otherSide.fieldName]?.isNullable ?? false}
		/>
	)
}
