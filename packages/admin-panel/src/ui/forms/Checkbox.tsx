import { cn } from "@admin-panel/utils/cn"
import { forwardRef, useId } from "react"
import { Checkbox, CheckboxProps as RaCheckboxProps, Text } from "react-aria-components"
import { ColorVariant, SizeVariant } from "../StyleVariant"
import { getLabelCss } from "./forms-css"

type Variant = "primary" | "secondary" | "accent" | "normal"

const colors: Record<ColorVariant, string> = {
	normal: cn(""),
	accent: cn("du-checkbox-accent"),
	primary: cn("du-checkbox-primary"),
	secondary: cn("du-checkbox-secondary"),
	error: cn("du-checkbox-error"),
	success: cn("du-checkbox-success"),
	warning: cn("du-checkbox-warning"),
	info: cn("du-checkbox-info"),
}

const sizes: Record<SizeVariant, string> = {
	small: cn("du-checkbox-sm"),
	medium: cn("du-checkbox-md"),
	large: cn("du-checkbox-lg"),
}

export type CheckboxProps = RaCheckboxProps & {
	label?: string
	description?: string
	error?: string
	placeholder?: string
	variant?: Variant
	size?: SizeVariant
	color?: ColorVariant
}
export const CheckboxInput = forwardRef<any, CheckboxProps>((props, ref) => {
	const {
		variant,
		label,
		error,
		description,
		placeholder,
		color = "normal",
		size = "medium",
		...rest
	} = props
	const describeId = useId()

	return (
		<Checkbox
			{...rest}
			ref={ref}
			aria-describedby={props.id}
			className={cn("my-1", rest.className)}
		>
			{({ isSelected, isIndeterminate, isFocusVisible, isDisabled }) => (
				<>
					<div className="flex gap-x-2 items-center">
						<div
							className={cn(
								"du-checkbox",
								colors[error ? "error" : color],
								sizes[size],
								"bg-base-100",
							)}
							aria-checked={isSelected}
							data-indeterminate={isIndeterminate}
							data-focus-visible={isFocusVisible}
							data-disabled={isDisabled}
							aria-label={rest["aria-label"] ?? label}
						></div>
						{label && <p className={cn(getLabelCss(props), "pb-0")}>{label}</p>}
					</div>

					{description && !error && (
						<Text id={describeId} className="text-sm text-neutral/70">
							{description}
						</Text>
					)}
					{error && (
						<Text id={describeId} className="text-sm text-error">
							{error}
						</Text>
					)}
				</>
			)}
		</Checkbox>
	)
})
