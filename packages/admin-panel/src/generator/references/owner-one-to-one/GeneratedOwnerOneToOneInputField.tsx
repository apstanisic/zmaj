import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { OwnerOneToOneInputField } from "@admin-panel/relation-components/owner-one-to-one/OwnerOneToOneInputField"
import { memo } from "react"
import { useManyToOneFieldProps } from "../many-to-one/useManyToOneFieldProps"

export const GeneratedOwnerOneToOneInputField = memo(() => {
	const { field, relation, label, template } = useManyToOneFieldProps()

	return (
		<OwnerOneToOneInputField
			label={label}
			template={template}
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			referenceProperty={relation.otherSide.propertyName ?? null}
			className={getFieldWidthCss(12)}
		/>
	)
})
