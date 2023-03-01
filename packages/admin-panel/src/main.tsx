import { FileCollection, throwErr } from "@zmaj-js/common"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {} from "react-dom/server"
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
				/>
			) : (
				<App apiUrl={apiUrl} adminPanelUrl={adminPanelUrl} />
			)}
		</StrictMode>
	</div>,
)
