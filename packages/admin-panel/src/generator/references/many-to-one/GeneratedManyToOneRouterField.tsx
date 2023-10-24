import { memo } from "react"
import { useActionContext } from "../../../context/action-context"
import { GeneratedManyToOneInputField } from "./GeneratedManyToOneInputField"
import { GeneratedManyToOneListField } from "./GeneratedManyToOneListField"
import { GeneratedManyToOneShowField } from "./GeneratedManyToOneShowField"

/**
 * This component is used only to route RA to proper action component
 */
export const GeneratedManyToOneRouterField = memo(() => {
	const action = useActionContext()

	if (action === "list") {
		return <GeneratedManyToOneListField />
	} else if (action === "show") {
		return <GeneratedManyToOneShowField />
	} else {
		return <GeneratedManyToOneInputField />
	}
})
