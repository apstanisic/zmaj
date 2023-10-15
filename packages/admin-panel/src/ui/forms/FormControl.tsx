import { cn } from "@admin-panel/utils/cn"
import { PropsWithChildren } from "react"
import { Label, Text } from "react-aria-components"
import { getLabelCss } from "./forms-css"

export const FormControl = (
	props: PropsWithChildren<{
		label?: string
		error?: string
		description?: string
		isRequired?: boolean
		ariaId?: string
	}>,
): JSX.Element => {
	const { isRequired, error, children, description, label, ariaId } = props
	return (
		<div className="mt-1 mb-0.5">
			{label && (
				<Label className={cn(getLabelCss({ error, isRequired }), "pb-0")}>{label}</Label>
			)}
			{children}

			<div className="min-h-[16px]">
				{description && !error && (
					<Text slot="description" className="text-sm text-neutral/70" id={ariaId}>
						{description}
					</Text>
				)}

				{error && (
					<Text slot="errorMessage" className="text-sm text-error" id={ariaId}>
						{error}
					</Text>
				)}
			</div>
		</div>
	)
}
