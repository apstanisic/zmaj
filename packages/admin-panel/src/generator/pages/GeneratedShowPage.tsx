import { ShowBase } from "ra-core"
import { PropsWithChildren, memo } from "react"
import { NonListToolbar, NonListToolbarProps } from "../../app-layout/non-list/NonListToolbar"
import { GeneratedShowLayout } from "../layouts/GeneratedShowLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

export const GeneratedShowPage = memo((props: PropsWithChildren<NonListToolbarProps>) => {
	const { children, ...rest } = props

	return (
		<GeneratedPageProvider action="show">
			<ShowBase>
				<div className="crud-content">
					<NonListToolbar {...rest} />
					{children ?? <GeneratedShowLayout />}
				</div>
			</ShowBase>
		</GeneratedPageProvider>
	)
})
