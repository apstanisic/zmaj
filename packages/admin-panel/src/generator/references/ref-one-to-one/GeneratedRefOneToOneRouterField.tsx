import { memo } from "react"
import { useActionContext } from "../../../context/action-context"
import { GeneratedRefOneToOneInputField } from "./GeneratedRefOneToOneInputField"
import { GeneratedRefOneToOneShowField } from "./GeneratedRefOneToOneShowField"

/**
 * This component is used only to route RA to proper action component
 */
export const GeneratedRefOneToOneRouterField = memo(() => {
	const action = useActionContext()

	if (action === "list") {
		return null
	} else if (action === "show") {
		return <GeneratedRefOneToOneShowField />
	} else {
		return <GeneratedRefOneToOneInputField />
	}
})
