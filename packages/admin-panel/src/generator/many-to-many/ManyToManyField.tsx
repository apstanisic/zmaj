import { title } from "radash"
import { memo, useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useRelationContext } from "../../context/relation-context"
import { getFieldWidthCss } from "../../crud-layouts/get-field-width-css"
import { AdminPanelError } from "../../shared/AdminPanelError"
import { throwInApp } from "../../shared/throwInApp"
import { ToManyCreateField } from "../to-many/input/create/ToManyCreateField"
import { useRelationRightSide } from "../use-relation-right-side"
import { ManyToManyInternalProps } from "./ManyToManyInternalProps.type"
import { ManyToManyEditField } from "./_ManyToManyEditField"
import { ManyToManyShowField } from "./_ManyToManyShowField"

/**
 * Many to Many field (CRUD)
 */
export const ManyToManyField = memo(() => {
	const action = useActionContext()
	const relation = useRelationContext() ?? throwInApp("432876")
	const rightSide = useRelationRightSide()

	//
	// const className = useMemo(() => getFieldWidthCss(12), [])
	// const label = relation.label ?? title(relation.propertyName ?? relation.leftColumn)
	// const template = relation.template ?? rightSide.displayTemplate ?? "{id}"

	// const shared: ManyToManyInternalProps = { label, template, className }
	const shared: ManyToManyInternalProps = useMemo(() => {
		const className = getFieldWidthCss(12)
		const label = relation.relation.label ?? title(relation.propertyName ?? relation.columnName)
		const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"
		return { label, template, className }
	}, [relation, rightSide])

	if (action === "list") {
		throw new AdminPanelError("#916623")
	} else if (action === "show") {
		return <ManyToManyShowField {...shared} />
	} else if (action === "create") {
		return <ToManyCreateField {...shared} relation={relation} fullWidthClasses="" />
	} else {
		return <ManyToManyEditField {...shared} />
	}
})
