import { ShowPageHeader } from "@admin-panel/app-layout/show/ShowPageHeader"
import { ShowBase } from "ra-core"
import { ReactNode, memo } from "react"
import { GeneratedShowLayout } from "../layouts/GeneratedShowLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

type GeneratedShowPageProps = {
	header?: ReactNode
	actions?: ReactNode
	children?: ReactNode
}

export const GeneratedShowPage = memo((props: GeneratedShowPageProps) => {
	const { children, header, actions } = props
	return (
		<GeneratedPageProvider action="show">
			<ShowBase>
				<div className="crud-content">
					{header ?? <ShowPageHeader actions={actions} />}
					{children ?? <GeneratedShowLayout />}
				</div>
			</ShowBase>
		</GeneratedPageProvider>
	)
})
