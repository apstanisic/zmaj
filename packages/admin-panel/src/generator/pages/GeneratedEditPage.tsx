import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useRecord } from "@admin-panel/hooks/use-record"
import { EditBase, RaRecord, TransformData, useResourceDefinition } from "ra-core"
import { memo, ReactNode, useCallback } from "react"
import { NonListToolbar, NonListToolbarProps } from "../../app-layout/non-list/NonListToolbar"
import { useSuccessRedirect } from "../../hooks/use-success-redirect"
import { GeneratedInputLayout } from "../layouts/GeneratedInputLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

type GeneratedEditPageProps = NonListToolbarProps & {
	children?: ReactNode
	transform?: TransformData
	onEdit?: (data: RaRecord) => Promise<unknown> | unknown
}

export const GeneratedEditPage = memo((props: GeneratedEditPageProps) => {
	const { children, transform, onEdit, ...rest } = props

	const resource = useResourceDefinition()
	useHtmlTitle(resource, "Edit")

	const successRedirect = useSuccessRedirect()

	const onSuccess = useCallback(
		async (data: RaRecord) => {
			successRedirect(data, "edit")
			await onEdit?.(data)
		},
		[onEdit, successRedirect],
	)

	return (
		<GeneratedPageProvider action="edit">
			<EditBase mutationMode="pessimistic" transform={transform} mutationOptions={{ onSuccess }}>
				<div className="crud-content">
					<WaitForData>
						<NonListToolbar {...rest} />
						{children ?? <GeneratedInputLayout />}
					</WaitForData>
				</div>
			</EditBase>
		</GeneratedPageProvider>
	)
})

/**
 * RA will render form without data, and then update.
 * This can cause problem with Select input
 */
function WaitForData({ children }: { children: ReactNode }): JSX.Element {
	const data = useRecord()

	if (data?.id === undefined) return <></>
	return <>{children}</>
}
