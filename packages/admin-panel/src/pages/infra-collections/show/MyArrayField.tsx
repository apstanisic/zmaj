import { useRecord } from "@admin-panel/hooks/use-record"
import { ListContextProvider } from "ra-core"
import { isArray, isObject } from "radash"
import { ReactNode } from "react"

export function MyArrayField(props: { source: string; children: ReactNode }) {
	const record = useRecord()
	const val = record?.[props.source]
	if (isArray(val))
		return (
			<ListContextProvider value={{ data: val } as any}>{props.children}</ListContextProvider>
		)
	if (isObject(val))
		return (
			<ListContextProvider value={{ data: Object.values(val) } as any}>
				{props.children}
			</ListContextProvider>
		)
	return <></>
}
