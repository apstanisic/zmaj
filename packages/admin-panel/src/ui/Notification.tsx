import { clsx } from "clsx"
import { ReactNode } from "react"

const classes = {
	standard: "",
	info: "du-alert-info",
	warning: "du-alert-warning",
	error: "du-alert-error",
	success: "du-alert-success",
}

type NotificationProps = {
	type?: "standard" | "info" | "warning" | "error" | "success"
	children?: ReactNode
}
export function Notification(props: NotificationProps): JSX.Element {
	return (
		<div className={clsx("du-alert w-auto rounded-md shadow", classes[props.type ?? "standard"])}>
			{props.children}
		</div>
	)
}
