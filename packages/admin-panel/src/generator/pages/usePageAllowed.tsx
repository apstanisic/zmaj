import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { useNotify, useRedirect } from "ra-core"
import { useEffect } from "react"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { RaAction } from "../../types/RaAction"

export function usePageAllowed(action: RaAction): boolean {
	const redirect = useRedirect()
	const notify = useNotify()
	const collection = useResourceCollection()

	const actionAuthz =
		action === "show" || action === "list"
			? "read"
			: collection.authzMustManage
			? "modify"
			: action

	const actionAllowed = useIsAllowed(actionAuthz, collection.authzKey)

	useEffect(() => {
		if (actionAllowed) return
		notify(`You are not allowed to access "${collection.label}"`, { type: "error" })
		redirect("/")
	}, [actionAllowed, collection, notify, redirect])

	return actionAllowed
}
