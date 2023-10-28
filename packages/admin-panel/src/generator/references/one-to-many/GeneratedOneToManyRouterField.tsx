import { memo } from "react"
import { useActionContext } from "../../../context/action-context"
import { GeneratedOneToManyCreateField } from "./GeneratedOneToManyCreateField"
import { GeneratedOneToManyEditField } from "./GeneratedOneToManyEditField"
import { GeneratedOneToManyShowField } from "./GeneratedOneToManyShowFIeld"

/**
 * This component is used only to route RA to proper action component
 */
export const GeneratedOneToManyRouterField = memo(() => {
	const action = useActionContext()

	if (action === "list") {
		return null
	} else if (action === "show") {
		return <GeneratedOneToManyShowField />
	} else if (action === "create") {
		return <GeneratedOneToManyCreateField />
	} else {
		return <GeneratedOneToManyEditField />
	}
})
