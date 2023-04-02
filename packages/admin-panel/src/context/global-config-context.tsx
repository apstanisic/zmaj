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

export type GlobalConfig = {
	apiUrl: string
	adminPanelUrl: string
	appName: string
	sidebarItems: SidebarItem[]
	imageInAuthPages?: string
}

export const [GlobalConfigContextProvider, useGlobalConfigContext] = generateContext<GlobalConfig>({
	adminPanelUrl: "/admin",
	apiUrl: "/api",
	sidebarItems: [],
	appName: "Admin Panel",
	// imageInAuthPages: "https://source.unsplash.com/random",
})
