import { cn } from "@admin-panel/utils/cn"
import { useId } from "react"
import { Switch, SwitchProps } from "react-aria-components"
import { Except } from "type-fest"
import { SizeVariant } from "../StyleVariant"
import { FormControl } from "./FormControl"
import { getLabelCss } from "./forms-css"

const sizes: Record<SizeVariant, string> = {
	large: cn("du-toggle-lg"),
	medium: cn("du-toggle-md"),
	small: cn("du-toggle-sm"),
}

export type SwitchInputProps = Except<SwitchProps, "defaultSelected" | "isSelected" | "value"> & {
	size?: SizeVariant
	label?: string
	isRequired?: boolean
	description?: string
	error?: string
	defaultValue?: boolean
	value?: boolean
}

export function SwitchInput(props: SwitchInputProps): JSX.Element {
	const { size = "medium", label, defaultValue, value, description, error, ...raProps } = props
	const id = useId()

	return (
		<div className={cn("my-3", props.className)}>
			<FormControl
				description={description}
				isRequired={raProps.isRequired}
				error={error}
				ariaId={id}
			>
				<Switch
					{...raProps}
					id={props.id ?? id}
					aria-aria-describedby={description || error ? id : undefined}
					aria-label={raProps["aria-label"] ?? label}
					isSelected={value}
					defaultSelected={defaultValue}
				>
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
									data-checked={isSelected}
								/>
							</div>
							{label && <p className={cn(getLabelCss({}), "pb-0")}>{label}</p>}
						</div>
					)}
				</Switch>
			</FormControl>
		</div>
	)
}
