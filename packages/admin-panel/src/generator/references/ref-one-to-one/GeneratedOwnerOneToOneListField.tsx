import { OwnerOneToOneListField } from "@admin-panel/relation-components/owner-one-to-one/OwnerOneToOneListField"
import { memo } from "react"
import { useManyToOneFieldProps } from "../many-to-one/useManyToOneFieldProps"

export const GeneratedOwnerOneToOneListField = memo(() => {
	const { field, relation, label, template } = useManyToOneFieldProps()

	return (
		<OwnerOneToOneListField
			label={label}
			template={template}
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
		/>
	)
})
