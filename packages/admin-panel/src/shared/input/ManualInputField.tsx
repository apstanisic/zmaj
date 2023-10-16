import { useRecord } from "@admin-panel/hooks/use-record"
import { title } from "radash"
import { ReactNode, memo } from "react"
import { useSearchParams } from "react-router-dom"
import { useFieldContext } from "../../context/field-context"
import { InputFieldProps } from "../../field-components/types/InputFieldProps"
import { DefaultInputField } from "./DefaultInputField"

type ManualInputFieldProps = Partial<InputFieldProps> & {
	source: string
	Component?: (props: InputFieldProps) => ReactNode
	// passProps?:
}

/**
 * @deprecated
 */
export const ManualInputField = memo((props: ManualInputFieldProps) => {
	const Component = props.Component ?? DefaultInputField
	const record = useRecord()
	const field = useFieldContext()

	const [searchParams] = useSearchParams()
	// const action: "edit" | "create" = props.action ?? "create"
	const source = props.source

	const disabledWithQuery = searchParams.get(`disable_${source}`) === "true"

	const joined: InputFieldProps = {
		...props,
		source,
		action: props.action,
		record,
		disabled: props.disabled || disabledWithQuery,
		isRequired: props.isRequired ?? false,
		value: record?.[source],
		label: props.label ?? title(source),
		fieldConfig: props.fieldConfig ?? field?.fieldConfig,
		placeholder: props.placeholder,
	}

	return <Component {...joined} />
})
