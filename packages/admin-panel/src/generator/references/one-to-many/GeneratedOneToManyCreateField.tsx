import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { OneToManyCreateField } from "@admin-panel/relation-components/one-to-many/OneToManyCreateField"
import { useOneToManyFieldProps } from "./useOneToManyFieldProps"

export function GeneratedOneToManyCreateField() {
	const { template, label, relation } = useOneToManyFieldProps()

	return (
		<OneToManyCreateField
			label={label}
			reference={relation.otherSide.collectionName}
			source={relation.propertyName}
			target={relation.otherSide.fieldName}
			template={template}
			className={getFieldWidthCss(12)}
			// disabled
		/>
	)
}
