import { FileCollection, throwErr } from "@zmaj-js/common"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { MdGTranslate, MdRadar, MdTimeToLeave } from "react-icons/md"
import { App } from "./App"
import "./styles/index.css"

const root = createRoot(document.getElementById("root")!)

const apiUrl = __API_URL__ ?? throwErr("2734")
const adminPanelUrl = __APP_URL__ ?? throwErr("90872")

const sidebarItems = [
	{
		path: "my/custom/path",
		label: "Custom Page",
		icon: <MdTimeToLeave />,
	},

	{
		path: "my/second/path",
		label: "NoLayoutPage",
		icon: <MdRadar />,
	},
	{
		path: "my/second/path",
		label: "With Authz",
		icon: <MdGTranslate />,
		authz: { action: "read", resource: FileCollection.authzKey },
	},
]

const customPages = [
	{
		Component() {
			return <div>Custom page with layout</div>
		},
		path: "/my/custom/path",
		hideLayout: false,
	},

	{
		Component() {
			return <div>Custom page without layout</div>
		},
		path: "/my/second/path",
		hideLayout: true,
	},
]

root.render(
	<div className="min-h-screen">
		<StrictMode>
			{/* Only add custom items in dev mode */}
			{import.meta.env.DEV ? (
				<App
					apiUrl={apiUrl}
					adminPanelUrl={adminPanelUrl}
					sidebarItems={sidebarItems}
					customPages={customPages}
					appName="Zmaj Dev"
					// imageInAuthPages="https://images.unsplash.com/photo-1678191092856-96d8d9304f86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
				/>
			) : (
				<App apiUrl={apiUrl} adminPanelUrl={adminPanelUrl} />
			)}
		</StrictMode>
	</div>,
)
