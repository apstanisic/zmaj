import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ZmajSdk } from "@zmaj-js/client-sdk"
import { TemplateParserPipe } from "@zmaj-js/common"
import { memoryStore, StoreContextProvider } from "ra-core"
import { useMemo } from "react"
import { IconContext } from "react-icons"
import { HashRouter } from "react-router-dom"
import { SetOptional } from "type-fest"
import { AdminPanel } from "./AdminPanel"
import { ZmajQueryClientProvider } from "./app-query-client"
import {
	GlobalConfig,
	GlobalConfigContextProvider,
	SidebarItem,
} from "./context/global-config-context"
import { SdkContextProvider } from "./context/sdk-context"
import { AddFieldComponentParams } from "./field-components/field-components"
import {
	useRegisterCrudLayout,
	UseRegisterCrudLayoutParams,
} from "./hooks/use-register-crud-layouts"
import { useRegisterFieldComponents } from "./hooks/use-register-field-components"
import { useRegisterTemplatePipes } from "./hooks/use-register-template-pipes"
import { CustomPage } from "./app-layout/CustomPage"

export type AppProps = SetOptional<
	GlobalConfig,
	"sidebarItems" | "appName" | "imageInAuthPages"
> & {
	fieldComponents?: AddFieldComponentParams[]
	crudLayouts?: UseRegisterCrudLayoutParams
	templatePipes?: { key: string; fn: TemplateParserPipe }[]
	customPages?: CustomPage[]
	sidebarItems?: SidebarItem[]
}

export function App(props: AppProps): JSX.Element {
	useRegisterFieldComponents(props.fieldComponents)
	useRegisterCrudLayout(props.crudLayouts)
	useRegisterTemplatePipes(props.templatePipes)

	const sdk = useMemo(
		() => new ZmajSdk({ url: props.apiUrl, name: "ADMIN_PANEL" }),
		[props.apiUrl], //
	)

	return (
		<IconContext.Provider value={{ size: "20px" ?? "1.2rem" }}>
			<GlobalConfigContextProvider
				value={{
					adminPanelUrl: props.adminPanelUrl,
					apiUrl: props.apiUrl,
					appName: props.appName ?? "Admin Panel",
					sidebarItems: props.sidebarItems ?? [],
					imageInAuthPages: props.imageInAuthPages,
				}}
			>
				<SdkContextProvider value={sdk}>
					{/* It throws error for some reason if I don't wrap manually */}
					<HashRouter>
						<StoreContextProvider value={memoryStore()}>
							<ZmajQueryClientProvider>
								<ReactQueryDevtools />

								{/* <QueryClientProvider client={appQueryClient}> */}
								<AdminPanel customPages={props.customPages} />
								{/* </QueryClientProvider> */}
							</ZmajQueryClientProvider>
						</StoreContextProvider>
					</HashRouter>
				</SdkContextProvider>
			</GlobalConfigContextProvider>
		</IconContext.Provider>
	)
}
