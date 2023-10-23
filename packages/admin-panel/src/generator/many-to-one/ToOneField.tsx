import { useRecord } from "@admin-panel/hooks/use-record"
import { title } from "radash"
import { memo, useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useFieldContext } from "../../context/field-context"
import { useRelationContext } from "../../context/relation-context"
import { getFieldWidthCss } from "../../crud-layouts/get-field-width-css"
import { throwInApp } from "../../shared/throwInApp"
import { GeneratedManyToOneListField } from "../references/many-to-one/GeneratedManyToOneListField"
import { GeneratedManyToOneShowField } from "../references/many-to-one/GeneratedManyToOneShowField"
import { useRelationRightSide } from "../use-relation-right-side"
import { ToOneInternalProps } from "./ToOneInternalProps.type"
import { ToOneInputField } from "./_ToOneInputField"

/**
 * Many to one field (CRUD)
 */
export const ToOneField = memo((props: { readonly?: boolean }) => {
	const action = useActionContext()
	const relation = useRelationContext() ?? throwInApp("10400")
	const field = useFieldContext() ?? throwInApp("380123")
	const rightSide = useRelationRightSide()

	const record = useRecord()

	const widthClasses = useMemo(
		() => getFieldWidthCss(field.fieldConfig.width ?? 12),
		[field.fieldConfig.width],
	)

	const label = relation.relation.label ?? title(relation.propertyName)

	// We need template for table we are referencing, since we are showing that table data
	// use relation template, but fall back to other collection template if not provided
	const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"

	const shared: ToOneInternalProps = {
		label,
		template,
		field,
		relation,
		mainRecord: record,
	}

	if (action === "list") {
		return <GeneratedManyToOneListField />
	} else if (action === "show") {
		return <GeneratedManyToOneShowField />
	} else {
		return <ToOneInputField {...shared} className={widthClasses} />
	}
})
