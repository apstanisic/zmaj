import { clsx } from "clsx"
import { mapKeys } from "radash"
import { CSSProperties } from "react"
import { useProgressBar } from "react-aria"

type WithCssParams = {
	[key: string]: unknown
}

function cssVars(params: WithCssParams): CSSProperties {
	return mapKeys(params, (key: string) => (key.startsWith("--") ? key : `--${key}`))
}

type CircularProgressProps = {
	size?: string
	thickness?: number
	className?: string
}

export function CircularProgress(props: CircularProgressProps): JSX.Element {
	const { progressBarProps } = useProgressBar({ isIndeterminate: true, "aria-label": "Loading" })

	return (
		<div
			{...progressBarProps}
			className={clsx(
				progressBarProps.className,
				"du-radial-progress  animate-spin",
				props.className,
			)}
			style={cssVars({
				value: 70,
				thickness: props.thickness ? `${props.thickness}px` : undefined,
				size: props.size,
			})}
		>
			{/* hello */}
		</div>
	)
}
