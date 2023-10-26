import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { OneToManyShowField } from "@admin-panel/relation-components/one-to-many/OneToManyShowField"
import { memo } from "react"
import { useOneToManyFieldProps } from "./useOneToManyFieldProps"

export const GeneratedOneToManyShowField = memo(() => {
	const { template, label, relation } = useOneToManyFieldProps()

	return (
		<OneToManyShowField
			reference={relation.otherSide.collectionName}
			target={relation.otherSide.fieldName}
			label={label}
			template={template}
			className={getFieldWidthCss(12)}
		/>
	)
})
