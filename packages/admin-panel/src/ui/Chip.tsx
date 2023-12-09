import { clsx } from "clsx"
import { ReactNode, useState } from "react"
import { MdClose } from "react-icons/md"
import { ButtonStyleColor } from "./StyleVariant"
import { IconButton } from "./buttons/IconButton"

type Props = {
	color?: ButtonStyleColor
	variant?: "normal" | "outlined"
	onClose?: () => void
	text: ReactNode
	closeLabel?: string
}

const colors: Record<ButtonStyleColor, string> = {
	accent: "du-badge-accent",
	error: "du-badge-error",
	info: "du-badge-info",
	link: "du-badge-link",
	primary: "du-badge-primary",
	secondary: "du-badge-secondary",
	success: "du-badge-success",
	warning: "du-badge-warning",
	normal: "",
	transparent: "du-badge-ghost", // text-gray-500",
}

/**
 * Maybe move open state to outside
 */
export function Chip(props: Props) {
	const { color = "normal" } = props
	const [open, setOpen] = useState(true)
	if (!open) return <></>
	return (
		<div
			className={clsx(
				"du-badge du-badge-lg flex items-center gap-x-1  text-sm",
				colors[color],
				props.variant === "outlined" && "du-badge-outline",
			)}
		>
			<span className=" max-w-[220px] overflow-hidden overflow-ellipsis whitespace-nowrap">
				{props.text}
			</span>

			{props.onClose && (
				<IconButton
					className="scale-75"
					aria-label={props.closeLabel ?? "Close"}
					onPress={() => {
						props.onClose?.()
						setOpen(false)
					}}
				>
					<MdClose className="" />
				</IconButton>
			)}
		</div>
	)
}
