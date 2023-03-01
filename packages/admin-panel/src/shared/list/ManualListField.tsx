import { useRecord } from "@admin-panel/hooks/use-record"
import { title } from "radash"
import { memo, ReactNode } from "react"
import { ListFieldProps } from "../../field-components/types/ListFieldProps"
import { DefaultListField } from "./DefaultLIstField"
import { RenderListField } from "./RenderListField"

type ManualListFieldProps = {
	Component?: (props: ListFieldProps) => JSX.Element | null
} & Partial<ListFieldProps> & {
		source: string
		render?: (props: ListFieldProps) => ReactNode
	}

export const ManualListField = memo((props: ManualListFieldProps) => {
	const Component = props.Component ?? DefaultListField
	const record = useRecord()
	const source = props.source

	const joined = {
		...props,
		source,
		record,
		action: "list" as const,
		value: record?.[source],
		label: props.label ?? title(source),
	}

	if (joined.render) {
		return <RenderListField {...joined} render={joined.render} />
	}

	return <Component {...joined} />
})
