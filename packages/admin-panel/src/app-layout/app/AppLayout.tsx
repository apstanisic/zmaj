import { clsx } from "clsx"
import dark from "highlight.js/styles/github-dark-dimmed.css?inline"
import light from "highlight.js/styles/github.css?inline"
import { CoreLayoutProps } from "ra-core"
import { memo, useMemo } from "react"
import { useTheme } from "../use-theme"
import { AppBar } from "./AppBar"
import { AppNotification } from "./AppNotification"
import { Sidebar } from "./AppSidebar"

/**
 * App Layout
 */
export const AppLayout = memo((props: CoreLayoutProps) => {
	const [theme] = useTheme()

	const highlightCss = useMemo(() => <style>{theme === "dark" ? dark : light}</style>, [theme])

	return (
		<div className="flex">
			{highlightCss}
			<Sidebar />
			<div className={clsx("mt-16 min-h-full w-full  md:w-[calc(100%-240px)]", "px-4 pb-8 pt-4")}>
				<AppBar widthCss="w-full md:w-[calc(100%-240px)]" heightCss="h-16" />

				{props.children}
			</div>
			<AppNotification />
		</div>
	)
})
