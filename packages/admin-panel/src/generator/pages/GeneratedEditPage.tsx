import { EditPageHeader } from "@admin-panel/app-layout/edit/EditPageHeader"
import { useRecord } from "@admin-panel/hooks/use-record"
import { zodResolver } from "@hookform/resolvers/zod"
import { EditBase, Form, RaRecord } from "ra-core"
import { ReactNode, memo, useCallback } from "react"
import { z } from "zod"
import { NonListToolbarProps } from "../../app-layout/non-list/NonListToolbar"
import { useSuccessRedirect } from "../../hooks/use-success-redirect"
import { GeneratedEditLayout } from "../layouts/GeneratedEditLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

type GeneratedEditPageProps = NonListToolbarProps & {
	onSuccess?: (created: RaRecord) => Promise<unknown>
	header?: ReactNode
	children?: ReactNode
	schema?: z.AnyZodObject
}

export const GeneratedEditPage = memo((props: GeneratedEditPageProps) => {
	const { children, onSuccess: onEdit, ...rest } = props

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
			<EditBase mutationMode="pessimistic" mutationOptions={{ onSuccess }}>
				<div className="crud-content">
					<EditForm>
						{/* <NonListToolbar {...rest} /> */}
						{props.header ?? <EditPageHeader />}
						{children ?? <GeneratedEditLayout />}
					</EditForm>
				</div>
			</EditBase>
		</GeneratedPageProvider>
	)
})

/**
 * RA will render form without data, and then update.
 * This can cause problem with Select input
 */
function EditForm({
	children,
	schema,
}: {
	children: ReactNode

	schema?: z.AnyZodObject
}): JSX.Element {
	const data = useRecord()

	if (data === undefined) return <></>

	return (
		<Form
			noValidate // Remove browser validation
			sanitizeEmptyValues={false} // Do not strip empty string. This completely removes property
			resolver={schema ? zodResolver(schema) : undefined}
			className="w-full h-full"
		>
			{children}
		</Form>
	)
}
