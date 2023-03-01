import { useObjectRef } from "@react-aria/utils"
import { useToggleState } from "@react-stately/toggle"
import { clsx } from "clsx"
import { forwardRef } from "react"
import { AriaCheckboxProps, useCheckbox } from "react-aria"

type Variant = "primary" | "secondary" | "accent" | "normal"

const colors: Record<Variant, string> = {
	accent: "du-btn-accent",
	primary: "du-btn-primary",
	secondary: "du-btn-secondary",
	normal: "",
}

const checkboxCss = (props: CheckboxProps): string =>
	clsx(
		"du-checkbox m-2 rounded bg-white",
		// it's jarringly white in dark theme
		!props.isSelected && "dark:bg-white/[0.3]",
		props.large ? "du-checkbox-md" : "du-checkbox-sm",
		colors[props.variant ?? "normal"],
		props.className,
	)

type CheckboxProps = AriaCheckboxProps & {
	variant?: Variant
	label?: string
	large?: boolean
	className?: string
}
export const Checkbox = forwardRef<any, CheckboxProps>((props, ref) => {
	const { variant, large, className, ...rest } = props
	const toggle = useToggleState(rest)
	const domRef = useObjectRef(ref)

	// we are setting label as children, since it check if there is label, but I'm passing
	// label as prop
	const { inputProps } = useCheckbox(
		{ ...rest, children: rest.label }, //
		toggle,
		domRef,
	)

	return (
		<div className="du-form-control flex-row items-center">
			<label>
				<input className={checkboxCss(props)} {...inputProps} ref={domRef} />
				{props.label}
			</label>
		</div>
	)
})
