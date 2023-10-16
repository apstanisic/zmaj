import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useRecord } from "@admin-panel/hooks/use-record"
import { cn } from "@admin-panel/utils/cn"
import { Struct } from "@zmaj-js/common"
import { Form } from "ra-core"
import { memo, PropsWithChildren, ReactNode } from "react"

type ManualInputLayoutProps = PropsWithChildren<{
	actions?: ReactNode
	defaultValues?: Struct
	className?: string
}>

/**
 * Default input layout
 */
export const CustomInputLayout = memo((props: ManualInputLayoutProps) => {
	const { actions, children, className, defaultValues } = props
	const record = useRecord()

	return (
		<Form
			className={cn("crud-content", className)}
			defaultValues={defaultValues ?? record}
			shouldUnregister={false}
			sanitizeEmptyValues={false}
		>
			{children}
			{actions !== undefined ? (
				actions
			) : (
				<div className="flex w-full justify-end">
					<SaveButton className="ml-auto" />
				</div>
			)}
		</Form>
	)
})
