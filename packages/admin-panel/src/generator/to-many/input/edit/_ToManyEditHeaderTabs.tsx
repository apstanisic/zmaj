import { clsx } from "clsx"
import { PropsWithChildren } from "react"

export function Amount(
	props: PropsWithChildren<{ amount: string | number; color: "success" | "error" | "info" }>,
) {
	return (
		<>
			<div>{props.children}</div>
			<div
				className={clsx(
					"du-badge du-badge-sm ml-2 flex items-center text-white",
					props.color === "success" && "du-badge-success",
					props.color === "info" && "du-badge-info",
					props.color === "error" && "du-badge-error",
				)}
				// badgeContent={String(props.amount)}
				// color={props.color}
				// classes={{ badge: "opacity-80" }}
			>
				{props.amount}
			</div>
		</>
	)
}
