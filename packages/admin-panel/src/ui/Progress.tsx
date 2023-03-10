import { clsx } from "clsx"
import { AriaProgressBarProps, useProgressBar } from "react-aria"
import { Except } from "type-fest"
import { StyleVariant } from "./StyleVariant"

type Color = Exclude<StyleVariant, "link" | "transparent">

const colors: Record<Color, string> = {
	accent: "bg-accent",
	error: "bg-error",
	info: "bg-info",
	primary: "bg-primary",
	secondary: "bg-secondary",
	success: "bg-success",
	warning: "bg-warning",
	normal: "bg-neutral",
}

type ProgressBarProps = Except<
	Except<AriaProgressBarProps, "label">,
	"minValue" | "maxValue" | "showValueLabel"
> & {
	className?: string
	variant?: Color
	showLabel?: boolean
	label?: string
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
	const { className, variant, showLabel, ...rest } = props
	const value = props.value ?? 0

	const { progressBarProps, labelProps } = useProgressBar({
		"aria-label": showLabel ? undefined : props.label,
		...rest,
		maxValue: 100,
		minValue: 0,
		showValueLabel: false,
		value,
	})

	return (
		<div {...progressBarProps} className={clsx("w-full ")}>
			{props.showLabel && (
				<div className="flex justify-between">
					<span {...labelProps}>{rest.label}</span>
					<span>{progressBarProps["aria-valuetext"]}</span>
				</div>
			)}
			<div className={clsx("min-h-[8px] w-full overflow-hidden rounded-md bg-base-300", className)}>
				<div
					className={clsx(
						"rounded-md",
						"w-full transition-transform duration-500",
						colors[variant ?? "normal"], //
					)}
					style={{
						// transform is supposed to be more performant for transition
						transform: `translateX(-${100 - value}%)`,
						height: "inherit",
						minHeight: "inherit",
					}}
				/>
			</div>
		</div>
	)
}
