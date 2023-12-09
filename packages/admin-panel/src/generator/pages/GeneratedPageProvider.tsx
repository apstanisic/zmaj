import { useSetCrudHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { ReactNode } from "react"
import { ActionContextProvider } from "../../context/action-context"
import { PropertiesContextProvider } from "../../context/property-context"
import { RaAction } from "../../types/RaAction"
import { useGenerateProperties } from "../properties/use-generate-properties"
import { usePageAllowed } from "./usePageAllowed"

type GeneratedPageProviderProps = {
	action: RaAction
	children: ReactNode
}

export function GeneratedPageProvider(props: GeneratedPageProviderProps) {
	const { action, children } = props
	const collection = useResourceCollection()

	const properties = useGenerateProperties({ action, collection })

	useSetCrudHtmlTitle()

	const allowed = usePageAllowed(action)
	if (!allowed) return <></>

	return (
		<ActionContextProvider value={action}>
			<PropertiesContextProvider value={properties}>{children}</PropertiesContextProvider>
		</ActionContextProvider>
	)
}
