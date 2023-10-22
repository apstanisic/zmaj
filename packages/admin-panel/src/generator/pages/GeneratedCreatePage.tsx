import { CreatePageHeader } from "@admin-panel/app-layout/create/CreatePageHeader"
import { useRecord } from "@admin-panel/hooks/use-record"
import { zodResolver } from "@hookform/resolvers/zod"
import { Struct } from "@zmaj-js/common"
import { CreateBase, Form, RaRecord } from "ra-core"
import { ReactNode, memo, useCallback, useMemo } from "react"
import { FieldValues } from "react-hook-form"
import { z } from "zod"
import { useSuccessRedirect } from "../../hooks/use-success-redirect"
import { GeneratedCreateLayout } from "../layouts/GeneratedCreateLayout"
import { GeneratedPageProvider } from "./GeneratedPageProvider"

type GeneratedCreatePageProps = {
	onSuccess?: (created: RaRecord) => Promise<unknown>
	header?: ReactNode
	children?: ReactNode
	defaultValues?: FieldValues | ((record?: Struct) => FieldValues)
	schema?: z.AnyZodObject
}

export const GeneratedCreatePage = memo((props: GeneratedCreatePageProps) => {
	const { children, onSuccess: propsOnSuccess, defaultValues, header, schema } = props
	const successRedirect = useSuccessRedirect()

	const onSuccess = useCallback(
		async (data: RaRecord) => {
			successRedirect(data, "create")
			await propsOnSuccess?.(data)
		},
		[propsOnSuccess, successRedirect],
	)

	return (
		<GeneratedPageProvider action="create">
			<CreateBase mutationOptions={{ onSuccess }}>
				<CreateForm defaultValues={defaultValues} schema={schema}>
					<div className="crud-content">
						{header ?? <CreatePageHeader />}
						{children ?? <GeneratedCreateLayout />}
					</div>
				</CreateForm>
			</CreateBase>
		</GeneratedPageProvider>
	)
})

function CreateForm(props: {
	children: ReactNode
	defaultValues?: FieldValues | ((record?: Struct) => FieldValues)
	schema?: z.AnyZodObject
}): JSX.Element {
	const record = useRecord()
	const defaultValues = useMemo(() => {
		if (typeof props.defaultValues === "function") return props.defaultValues(record)
		return props.defaultValues
	}, [props, record])

	return (
		<Form
			defaultValues={defaultValues}
			noValidate // Remove browser validation
			sanitizeEmptyValues={false} // Do not strip empty string. This completely removes property
			resolver={props.schema ? zodResolver(props.schema) : undefined}
			className="w-full h-full"
		>
			{props.children}
		</Form>
	)
}
