import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { RefOneToOneShowField } from "@admin-panel/relation-components/ref-one-to-one/RefOneToOneShowField"
import { memo } from "react"
import { useOneToManyFieldProps } from "../one-to-many/useOneToManyFieldProps"

export const GeneratedRefOneToOneShowField = memo(() => {
	const { template, label, relation, mainRecord } = useOneToManyFieldProps()

	return (
		<RefOneToOneShowField
			target={relation.otherSide.fieldName}
			reference={relation.otherSide.collectionName}
			label={label}
			template={template}
			className={getFieldWidthCss(12)}
		/>
	)
})
