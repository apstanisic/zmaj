import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { cn } from "@admin-panel/utils/cn"
import { Struct } from "@zmaj-js/common"
import { ReactNode, memo } from "react"

type ManualInputLayoutProps = {
	actions?: ReactNode
	defaultValues?: Struct
	className?: string
	children?: ReactNode
}

/**
 * Default input layout
 */
export const CustomInputLayout = memo((props: ManualInputLayoutProps) => {
	const { actions, children, className, defaultValues } = props

	return (
		<div className={cn("crud-content", className)}>
			{children}
			{actions !== undefined ? (
				actions
			) : (
				<div className="flex w-full justify-end">
					<SaveButton className="ml-auto" />
				</div>
			)}
		</div>
	)
})
