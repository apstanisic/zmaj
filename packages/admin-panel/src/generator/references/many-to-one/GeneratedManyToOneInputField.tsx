import { useActionContext } from "@admin-panel/context/action-context"
import { getFieldWidthCss } from "@admin-panel/crud-layouts/get-field-width-css"
import { useIsAllowed } from "@admin-panel/hooks/use-is-allowed"
import { ManyToOneInputField } from "@admin-panel/relation-components/many-to-one/ManyToOneInputField/ManyToOneInputField"
import { memo } from "react"
import { useManyToOneFieldProps } from "./useManyToOneFieldProps"

export const GeneratedManyToOneInputField = memo(() => {
	const { template, label, field, relation } = useManyToOneFieldProps()

	const action = useActionContext()
	// FIX ME. I should pass authzKey
	const actionAllowed = useIsAllowed(action, relation.collectionName, field.fieldName)

	const disabled = !actionAllowed || (action === "create" ? !field.canCreate : !field.canUpdate)

	return (
		<ManyToOneInputField
			source={field.fieldName}
			reference={relation.otherSide.collectionName}
			label={label}
			template={template}
			disabled={disabled}
			className={getFieldWidthCss(12)}
		/>
	)
})
