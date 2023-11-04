import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { RefOneToOneEditField } from "@admin-panel/relation-components/ref-one-to-one/RefOneToOneEditField"
import { memo } from "react"
import { useOneToManyFieldProps } from "../one-to-many/useOneToManyFieldProps"

export const GeneratedRefOneToOneInputField = memo(() => {
	const { template, label, relation } = useOneToManyFieldProps()

	return (
		<RefOneToOneEditField
			target={relation.otherSide.fieldName}
			reference={relation.otherSide.collectionName}
			label={label}
			template={template}
			className={getFieldWidthCss(12)}
		/>
	)
})
