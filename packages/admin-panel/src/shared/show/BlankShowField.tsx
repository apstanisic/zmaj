import { useRecord } from "@admin-panel/hooks/use-record"
import { RaRecord } from "ra-core"

export function BlankShowField<T = RaRecord>(props: {
	render: (record: T) => JSX.Element | string
}) {
	const record = useRecord()

	if (!record) return <></>
	return <>{props.render(record as T)}</>
}
