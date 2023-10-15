import { CreateBase, RaRecord, TransformData } from "ra-core"
import { ReactNode, memo, useCallback } from "react"
import { NonListToolbar, NonListToolbarProps } from "../../app-layout/non-list/NonListToolbar"
import { useSuccessRedirect } from "../../hooks/use-success-redirect"
import { GeneratedInputLayout } from "../layouts/GeneratedInputLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

type GeneratedCreatePageProps = NonListToolbarProps & {
	children?: ReactNode
	onCreate?: (item: RaRecord) => Promise<unknown> | unknown
	transform?: TransformData
}

export const GeneratedCreatePage = memo((props: GeneratedCreatePageProps) => {
	const { children, onCreate, ...rest } = props
	const successRedirect = useSuccessRedirect()

	const onSuccess = useCallback(
		async (data: RaRecord) => {
			successRedirect(data, "create")
			await onCreate?.(data)
		},
		[onCreate, successRedirect],
	)

	return (
		<GeneratedPageProvider action="create">
			<CreateBase mutationOptions={{ onSuccess }} transform={props.transform}>
				<div className="crud-content">
					<NonListToolbar {...rest} />
					{children ?? <GeneratedInputLayout />}
				</div>
			</CreateBase>
		</GeneratedPageProvider>
	)
})
