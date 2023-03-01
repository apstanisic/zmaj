import { generateContext } from "../utils/generate-context"

export type SidebarItem = {
	path: string
	label: string
	icon?: JSX.Element
	authz?: {
		resource: string
		action: string
	}
}

type GlobalConfig = {
	apiUrl: string
	adminPanelUrl: string
	appName: string
	sidebarItems: SidebarItem[]
}

export const [GlobalConfigContextProvider, useGlobalConfigContext] = generateContext<GlobalConfig>({
	adminPanelUrl: "/admin",
	apiUrl: "/api",
	sidebarItems: [],
	appName: "Admin Panel",
})
