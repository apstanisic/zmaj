import { clsx } from "clsx"

export function Card(props: JSX.IntrinsicElements["div"]) {
	return <div className={clsx("du-card m-3 shadow", props.className)}>{props.children}</div>
}
