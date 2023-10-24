import { memo } from "react"
import { useActionContext } from "../../../context/action-context"
import { GeneratedOwnerOneToOneListField } from "./GeneratedOwnerOneToOneListField"
import { GeneratedOwnerOneToOneShowField } from "./GeneratedOwnerOneToOneShowField"

/**
 * This component is used only to route RA to proper action component
 */
export const GeneratedOwnerOneToOneRouterField = memo(() => {
	const action = useActionContext()

	if (action === "list") {
		return <GeneratedOwnerOneToOneListField />
	} else if (action === "show") {
		return <GeneratedOwnerOneToOneShowField />
	} else {
		return <>TODO!!!</>
	}
})
