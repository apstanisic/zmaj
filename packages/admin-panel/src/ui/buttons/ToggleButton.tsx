import { cn } from "@admin-panel/utils/cn"
import {
	ToggleButton as RaToggleButton,
	ToggleButtonProps as RaToggleButtonProps,
} from "react-aria-components"
import { SizeVariant } from "../StyleVariant"

const sizes: Record<SizeVariant, string> = {
	large: cn("du-toggle-lg"),
	medium: cn("du-toggle-md"),
	small: cn("du-toggle-sm"),
}

export type ToggleButtonProps = RaToggleButtonProps & {
	size?: SizeVariant
	label?: string
	"aria-label": string
}
/**
 * Not same as switch
 * @see https://github.com/adobe/react-spectrum/issues/1264
 */
export function ToggleButton(props: ToggleButtonProps): JSX.Element {
	const { size = "medium", label, ...raProps } = props
	return (
		<div>
			<RaToggleButton {...raProps} className={cn("outline-none", props.className)}>
				{({ isSelected, isDisabled, isFocusVisible }) => (
					<div className="flex gap-x-2 items-center">
						<div
							className={cn(
								isFocusVisible && "ring ring-offset-2 ring-base-300 rounded-lg",
							)}
						>
							<div
								className={cn(
									"du-toggle",
									sizes[size],
									isDisabled && "pointer-events-none bg-base-200",
								)}
								aria-checked={isSelected}
								aria-hidden={true}
							/>
						</div>
						{label}
					</div>
				)}
			</RaToggleButton>
		</div>
	)
}
