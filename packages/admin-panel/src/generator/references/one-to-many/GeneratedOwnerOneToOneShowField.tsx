import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { OwnerOneToOneShowField } from "@admin-panel/relation-components/owner-one-to-one/OwnerOneToOneShowField"
import { memo } from "react"
import { useManyToOneFieldProps } from "../many-to-one/useManyToOneFieldProps"

export const GeneratedOwnerOneToOneShowField = memo(() => {
	const { template, label, field, relation } = useManyToOneFieldProps()

	return (
		<OwnerOneToOneShowField
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			label={label}
			template={template}
			className={getFieldWidthCss(12)}
		/>
	)
})
