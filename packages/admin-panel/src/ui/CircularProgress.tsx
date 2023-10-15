import { cn } from "@admin-panel/utils/cn"
import { CSSProperties } from "react"
import { ProgressBar } from "react-aria-components"

type CircularProgressProps = {
	size?: string
	thickness?: number
	className?: string
}

export function CircularProgress(props: CircularProgressProps): JSX.Element {
	return (
		<ProgressBar
			isIndeterminate
			className={cn("du-radial-progress  animate-spin", props.className)}
			aria-label="Please wait..."
			// We are passing this vars that will be read by daisyUI
			style={
				{
					"--value": 70,
					"--thickness": props.thickness ? `${props.thickness}px` : undefined,
					"--size": props.size,
				} as CSSProperties
			}
		>
			{/* hello */}
		</ProgressBar>
	)
}
