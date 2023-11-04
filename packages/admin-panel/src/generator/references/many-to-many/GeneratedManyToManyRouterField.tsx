import { useActionContext } from "@admin-panel/context/action-context"
import { GeneratedManyToManyCreateField } from "./GeneratedManyToManyCreateField"
import { GeneratedManyToManyEditField } from "./GeneratedManyToManyEditField"
import { GeneratedManyToManyShowField } from "./GeneratedManyToManyShowField"

export function GeneratedManyToManyRouterField(): JSX.Element {
	const action = useActionContext()
	if (action === "show") return <GeneratedManyToManyShowField />
	if (action === "create") return <GeneratedManyToManyCreateField />
	if (action === "edit") return <GeneratedManyToManyEditField />
	return <></>
}
