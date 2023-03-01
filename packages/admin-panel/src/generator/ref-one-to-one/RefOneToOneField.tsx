import { useRecord } from "@admin-panel/hooks/use-record"
import { title } from "radash"
import { memo, useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useRelationContext } from "../../context/relation-context"
import { getFieldWidthCss } from "../../crud-layouts/get-field-width-css"
import { throwInApp } from "../../shared/throwInApp"
import { useRelationRightSide } from "../use-relation-right-side"
import { RefOneToOneInternalProps } from "./ref-one-to-one-props.type"
import { RefOneToOneInputField } from "./RefOneToOneInputFIeld"
import { RefOneToOneListField } from "./RefOneToOneListField"
import { RefOneToOneShowField } from "./RefOneToOneShowField"

/**
 * Many to one field (CRUD)
 */
export const RefOneToOneField = memo(() => {
	const action = useActionContext()
	const relation = useRelationContext() ?? throwInApp("10400")
	const rightSide = useRelationRightSide()

	const record = useRecord()

	const widthClasses = useMemo(() => getFieldWidthCss(12), [])

	const label = relation.relation.label ?? title(relation.propertyName)

	// We need template for table we are referencing, since we are showing that table data
	// use relation template, but fall back to other collection template if not provided
	const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"

	if (!record) return <></>

	const shared: RefOneToOneInternalProps = { label, template, relation, mainRecord: record }

	if (action === "list") {
		return <RefOneToOneListField {...shared} />
		// return <RefOneToOneListField {...shared} />
	} else if (action === "show") {
		return <RefOneToOneShowField {...shared} className={widthClasses} />
	} else {
		return <RefOneToOneInputField {...shared} className={widthClasses} />
	}
})
