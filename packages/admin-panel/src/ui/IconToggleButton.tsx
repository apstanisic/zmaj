import { IconButton, IconButtonProps } from "@admin-panel/ui/buttons/IconButton"
import { clsx } from "clsx"
import { ReactNode } from "react"
type IconToggleProps = Omit<IconButtonProps, "children"> & {
	isOn: boolean
	on: ReactNode
	off: ReactNode
}

export function IconToggleButton(props: IconToggleProps): JSX.Element {
	const { isOn, on, off, ...rest } = props

	return (
		<IconButton
			{...rest}
			className={clsx(
				"du-swap-rotate du-swap relative",
				isOn && "du-swap-active",
				rest.className,
			)}
		>
			<span className={clsx("du-swap-on absolute")}>{on}</span>
			<span className={clsx("du-swap-off absolute")}>{off}</span>
		</IconButton>
	)
}
