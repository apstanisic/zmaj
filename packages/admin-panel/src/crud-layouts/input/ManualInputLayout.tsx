import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useRecord } from "@admin-panel/hooks/use-record"
import { Struct } from "@zmaj-js/common"
import { clsx } from "clsx"
import { Form } from "ra-core"
import { memo, PropsWithChildren, ReactNode } from "react"

type ManualInputLayoutProps = PropsWithChildren<{
	actions?: ReactNode
	defaultValues?: Struct
	className?: string
	enableNoChangeSubmit?: boolean
}>

/**
 * Default input layout
 */
export const ManualInputLayout = memo((props: ManualInputLayoutProps) => {
	const record = useRecord()
	return (
		<Form
			className={clsx("crud-content", props.className)}
			defaultValues={props.defaultValues ?? record}
			shouldUnregister={false}
		>
			{props.children}
			{props.actions ?? (
				<div className="flex w-full justify-end">
					<SaveButton className="ml-auto" />
				</div>
			)}
		</Form>
	)
})
