import { ManyToOneListField } from "@admin-panel/relation-components/many-to-one/ManyToOneListField"
import { memo } from "react"
import { useToOneField } from "./useToOneField"

export const GeneratedManyToOneListField = memo(() => {
	const { field, relation, label, template, className } = useToOneField()

	return (
		<ManyToOneListField
			label={label}
			template={template}
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			className={className}
		/>
	)
})
