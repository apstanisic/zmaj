import { LayoutConfigContextProvider } from "@admin-panel/context/layout-config-context"
import { useSetCrudHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { LayoutConfigSchema } from "@zmaj-js/common"
import { useNotify, useRedirect } from "ra-core"
import { ReactNode, useEffect } from "react"
import { ActionContextProvider } from "../../context/action-context"
import { PropertiesContextProvider } from "../../context/property-context"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { RaAction } from "../../types/RaAction"
import { useGenerateProperties } from "../properties/use-generate-properties"

export function GeneratedPageProvider<Action extends RaAction>({
	action,
	children,
}: {
	action: Action
	children: ReactNode
}): JSX.Element {
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

	const properties = useGenerateProperties({ action, collection })

	useEffect(() => {
		if (actionAllowed) return
		notify(`You are not allowed to access "${collection.label}"`, { type: "error" })
		redirect("/")
	}, [actionAllowed, collection, notify, redirect])

	useSetCrudHtmlTitle()

	return (
		<ActionContextProvider value={action}>
			<LayoutConfigContextProvider value={LayoutConfigSchema.parse(collection.layoutConfig)}>
				<PropertiesContextProvider value={properties}>{children}</PropertiesContextProvider>
			</LayoutConfigContextProvider>
		</ActionContextProvider>
	)
}
