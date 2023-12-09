import { OnlyChildren } from "../types/OnlyChildren"

export function Columns(props: OnlyChildren) {
	return <div className="flex w-full gap-x-3">{props.children}</div>
}
