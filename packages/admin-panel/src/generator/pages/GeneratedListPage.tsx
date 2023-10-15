import { useResourceDefinition } from "ra-core"
import { memo } from "react"
import { SetOptional } from "type-fest"
import { ListPageLayout, ListPageLayoutProps } from "../../app-layout/list/ListPageLayout"
import { GeneratedListLayout } from "../layouts/GeneratedListLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

export const GeneratedListPage = memo((props: SetOptional<ListPageLayoutProps, "children">) => {
	const { children, ...layoutProps } = props
	const resource = useResourceDefinition()

	return (
		<GeneratedPageProvider action="list">
			{/* List has special layout */}
			<ListPageLayout {...layoutProps}>{children ?? <GeneratedListLayout />}</ListPageLayout>
		</GeneratedPageProvider>
	)
})
