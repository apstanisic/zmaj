import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { ManyToOneShowField } from "@admin-panel/relation-components/many-to-one/ManyToOneShowField"
import { memo } from "react"
import { useToOneField } from "./useToOneField"

export const GeneratedManyToOneShowField = memo(() => {
	const { template, label, field, relation } = useToOneField()

	return (
		<ManyToOneShowField
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			label={label}
			template={template}
			className={getFieldWidthCss(12)}
		/>
	)
})
