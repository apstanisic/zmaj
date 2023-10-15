import { clsx } from "clsx"
import { ReactNode } from "react"
import { ButtonStyleColor } from "./StyleVariant"

type Props = JSX.IntrinsicElements["ul"] & {
	steps: ReactNode[]
	/** Zero index */
	currentStep: number
	vertical?: boolean
	variant?: Variant
}
/**
 * TODO try to add animations
 */
export function Stepper(props: Props): JSX.Element {
	const { className, steps, currentStep, variant, ...rest } = props

	return (
		<ul
			{...rest}
			className={clsx(
				" du-steps w-full ",
				props.vertical && "du-steps-vertical",
				props.className,
			)}
		>
			{steps.map((step, i) => (
				<li
					key={i}
					className={clsx("du-step", currentStep >= i && colors[variant ?? "normal"])}
				>
					{step}
				</li>
			))}
		</ul>
	)
}
type Variant = Exclude<ButtonStyleColor, "link" | "transparent">

const colors: Record<Variant, string> = {
	primary: "du-step-primary",
	secondary: "du-step-secondary",
	accent: "du-step-accent",
	info: "du-step-info",
	success: "du-step-success",
	warning: "du-step-warning",
	error: "du-step-error",
	normal: "du-step-neutral",
}
