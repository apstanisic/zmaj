import { clsx } from "clsx"
import { SeparatorProps, useSeparator } from "react-aria"

type Props = SeparatorProps & {
	vertical?: boolean
	className?: string
}
export function Divider(props: Props): JSX.Element {
	const { separatorProps } = useSeparator(props)
	return (
		<div
			className={clsx("du-divider", props.vertical && "du-divider-vertical", props.className)}
			{...separatorProps}
		>
			{/* {props.children} */}
		</div>
	)
}
