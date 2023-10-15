import { useRecord } from "@admin-panel/hooks/use-record"
import { get, title } from "radash"
import { ReactNode, memo } from "react"
import { ShowFieldProps } from "../../field-components/types/ShowFieldProps"
import { RenderShowField } from "./RenderShowField"

type ManualShowFieldProps = {
	Component?: (props: ShowFieldProps) => ReactNode
} & Partial<ShowFieldProps> & {
		source: string
		render?: (props: ShowFieldProps) => ReactNode
	}

export const ManualShowField = memo((props: ManualShowFieldProps) => {
	const Component = props.Component ?? RenderShowField
	const record = useRecord()
	const source = props.source

	const value = props.value ?? get(record, source)

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
