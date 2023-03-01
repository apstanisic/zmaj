import { LayoutConfigContextProvider } from "@admin-panel/context/layout-config-context"
import { LayoutConfigSchema } from "@zmaj-js/common"
import { ResourceOptions, useNotify, useRedirect, useResourceDefinition } from "ra-core"
import { ReactNode, useEffect } from "react"
import { ActionContextProvider } from "../../context/action-context"
import { CollectionContextProvider } from "../../context/collection-context"
import { PropertiesContextProvider } from "../../context/property-context"
import { useIsAllowed } from "../../hooks/use-is-allowed"
import { throwInApp } from "../../shared/throwInApp"
import { useGetCollection } from "../../state/use-get-collection"
import { RaAction } from "../../types/RaAction"
import { useGenerateProperties } from "../properties/use-generate-properties"

export function GeneratedPageProvider<Action extends RaAction>({
	action,
	children,
}: {
	action: Action
	children: ReactNode
}): JSX.Element {
	const resource = useResourceDefinition()
	// if page no longer exist redirect to home page?
	const collection = useGetCollection(resource.name) ?? throwInApp("5389 " + resource.name)
	const redirect = useRedirect()
	const notify = useNotify()
	const options: ResourceOptions = resource.options ?? {}

	const actionAuthz = options.authzActions?.[action] ?? action

	const actionAllowed = useIsAllowed(actionAuthz, options.authzResource ?? collection.authzKey)

	const properties = useGenerateProperties({ action, collection })

	useEffect(() => {
		if (actionAllowed) return
		notify(`You are not allowed to access "${collection.tableName}"`, { type: "error" })
		redirect("/")
	}, [actionAllowed, collection.tableName, notify, redirect])

	return (
		<ActionContextProvider value={action}>
			<CollectionContextProvider value={collection}>
				<LayoutConfigContextProvider value={LayoutConfigSchema.parse(collection.layoutConfig)}>
					<PropertiesContextProvider value={properties}>
						{children}
						{/*  */}
					</PropertiesContextProvider>
				</LayoutConfigContextProvider>
			</CollectionContextProvider>
		</ActionContextProvider>
	)
}
