import { useRecord } from "@admin-panel/hooks/use-record"
import { get, title } from "radash"
import { memo, ReactNode } from "react"
import { ShowFieldProps } from "../../field-components/types/ShowFieldProps"
import { DefaultShowField } from "./DefaultShowField"
import { RenderShowField } from "./RenderShowField"

type ManualShowFieldProps = {
	Component?: (props: ShowFieldProps) => JSX.Element | null
} & Partial<ShowFieldProps> & {
		source: string
		render?: (props: ShowFieldProps) => ReactNode
		/**
		 * @internal @temp
		 */
		__fallbackValue?: any
	}

export const ManualShowField = memo((props: ManualShowFieldProps) => {
	const Component = props.Component ?? DefaultShowField
	const record = useRecord()
	const source = props.source

	// null is legitimate value. Only ignore undefined
	let value = props.value
	if (value === undefined) value = get(record, source)
	if (value === undefined) value = props.__fallbackValue

	const joined = {
		...props,
		source,
		record,
		value,
		// value: props.value ?? get(record, source) ,
		action: "show" as const,
		label: props.label ?? title(source),
	}

	if (joined.render) {
		return <RenderShowField {...joined} render={joined.render} />
	}

	return <Component {...joined} />
})
