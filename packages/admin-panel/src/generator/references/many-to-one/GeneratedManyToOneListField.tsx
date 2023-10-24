import { ManyToOneListField } from "@admin-panel/relation-components/many-to-one/ManyToOneListField"
import { memo } from "react"
import { useManyToOneFieldProps } from "./useManyToOneFieldProps"

export const GeneratedManyToOneListField = memo(() => {
	const { field, relation, label, template } = useManyToOneFieldProps()

	return (
		<ManyToOneListField
			label={label}
			template={template}
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
		/>
	)
})
