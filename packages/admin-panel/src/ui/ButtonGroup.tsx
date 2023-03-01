import { clsx } from "clsx"

type Props = JSX.IntrinsicElements["div"] & {
	vertical?: boolean
}
export function ButtonGroup({ vertical, children, ...props }: Props): JSX.Element {
	return (
		<div className={clsx("du-btn-group", vertical && "du-btn-group-vertical", props.className)}>
			{children}
		</div>
	)
}
