import { title } from "radash"
import { memo, useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useRelationContext } from "../../context/relation-context"
import { fullWidthFieldCss } from "../../crud-layouts/get-field-width-css"
import { AdminPanelError } from "../../shared/AdminPanelError"
import { throwInApp } from "../../shared/throwInApp"
import { ToManyCreateField } from "../to-many/input/create/ToManyCreateField"
import { useRelationRightSide } from "../use-relation-right-side"
import { OneToManyInternalProps } from "./OneToManyInternalProps.type"
import { OneToManyEditField } from "./_OneToManyEditField"
import { OneToManyShowField } from "./_OneToManyShowField"

/**
 * Many to one field (CRUD)
 */
export const OneToManyField = memo(() => {
	const action = useActionContext()
	const relation = useRelationContext() ?? throwInApp()
	const rightSide = useRelationRightSide()

	const sharedProps = useMemo<OneToManyInternalProps>(() => {
		const label = relation.relation.label ?? title(relation.propertyName ?? relation.columnName)
		const template = relation.relation.template ?? rightSide?.displayTemplate ?? "{id}"

		return {
			label,
			template,
			relation,
			fullWidthClasses: fullWidthFieldCss,
		}
	}, [relation, rightSide?.displayTemplate])

	if (action === "list") {
		throw new AdminPanelError("9012342")
	} else if (action === "show") {
		return <OneToManyShowField {...sharedProps} />
	} else if (action === "create") {
		return <ToManyCreateField {...sharedProps} />
	} else {
		return <OneToManyEditField {...sharedProps} />
	}
})
