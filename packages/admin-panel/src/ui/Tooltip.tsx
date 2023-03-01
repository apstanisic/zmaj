import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom"
import { clsx } from "clsx"
import { ReactNode, useState } from "react"
import { StyleVariant } from "./StyleVariant"

type Color = Exclude<StyleVariant, "link" | "transparent">

const colors: Record<Color, string> = {
	accent: "bg-accent  text-accent-content",
	error: "bg-error  text-error-content",
	info: "bg-info  text-info-content",
	primary: "bg-primary  text-primary-content",
	secondary: "bg-secondary  text-secondary-content",
	success: "bg-success  text-success-content",
	warning: "bg-warning  text-warning-content",
	normal: "bg-neutral  text-neutral-content",
}

type Props = {
	text: string | number
	className?: string
	variant?: Color
	side?: "left" | "right" | "top" | "bottom"
	forceOpen?: boolean
	children?: ReactNode
}

export function Tooltip({ children, ...props }: Props): JSX.Element {
	if (props.text === "") return <>{children}</>
	return <TooltipInner {...props}>{children}</TooltipInner>
}

/**
 * I'm not sure how much performance impact does popper uses, so there is inner component
 * so we can call component without calling `useFloating` hook
 */
function TooltipInner(props: Props): JSX.Element {
	const [show, setShow] = useState(false)
	const { x, y, reference, floating, strategy } = useFloating({
		middleware: [offset(10), flip(), shift()],
		placement: props.side,
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
	})

	return (
		<>
			<div ref={reference} onMouseLeave={() => setShow(false)} onMouseEnter={() => setShow(true)}>
				{props.children}
			</div>
			{show && (
				<div
					ref={floating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
						width: "max-content",
					}}
					className={clsx(
						colors[props.variant ?? "normal"],
						// border is because of divider in list causes top border
						"z-[200] rounded-md border-transparent py-0.5 px-2 text-sm",
						props.className,
					)}
				>
					{props.text}
				</div>
			)}
		</>
	)
}
