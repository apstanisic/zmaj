import { CustomRoutes } from "ra-core"
import { Route } from "react-router"

export type CustomPage = {
	path: string

	icon?: JSX.Element
	Component: () => JSX.Element
	hideLayout?: boolean
}

export function renderCustomPages(pages: CustomPage[]): JSX.Element {
	const withLayout = pages.filter((p) => p.hideLayout !== true)
	const withoutLayout = pages.filter((p) => p.hideLayout)

	return (
		<>
			{withLayout.length > 0 && (
				<CustomRoutes>
					{withLayout.map((page, i) => (
						<Route key={`page_layout${i}`} element={<page.Component />} path={page.path} />
					))}
				</CustomRoutes>
			)}

			{withoutLayout.length > 0 && (
				<CustomRoutes noLayout>
					{withoutLayout.map((page, i) => (
						<Route key={`page_no_layout${i}`} element={<page.Component />} path={page.path} />
					))}
				</CustomRoutes>
			)}
		</>
	)
}
