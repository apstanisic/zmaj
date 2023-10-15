import { InputFieldProps } from "@admin-panel/field-components/types/InputFieldProps"
import { InputProps } from "@admin-panel/ui/Input"
import { isNil } from "@zmaj-js/common"
import { required, useInput, Validator } from "ra-core"
import { title } from "radash"
import { HTMLInputTypeAttribute } from "react"
import { ControllerRenderProps, FieldError } from "react-hook-form"
import { parseInput } from "./input-parsers"

export type UseInputFieldProps = {
	source: string
	label?: string | null
	disabled?: boolean
	isRequired?: boolean
	description?: string | null
	placeholder?: string
	fromInput?: (value: unknown) => unknown
	toInput?: (value: unknown) => unknown
	validate?: Validator[]
	defaultValue?: unknown
	id?: string
	type?: HTMLInputTypeAttribute
	keepEmpty?: boolean
	className?: string
	fieldConfig?: InputFieldProps["fieldConfig"]
}

export type UseInputFieldResult = {
	field: Omit<ControllerRenderProps<any, string>, "ref">
	inputRef: ControllerRenderProps["ref"]
	isRequired: boolean
	disabled: boolean
	label: string
	source: string
	placeholder?: string
	error?: FieldError
	isDirty: boolean
	id: string
	isTouched: boolean
	helperText: string
	status?: "error"
	type: HTMLInputTypeAttribute
	className?: string
	name: string
	//   type:
}

export const dateTimeLocalRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/
export const dateRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/

const parseValidators = (props: UseInputFieldProps): Validator[] => {
	const validators = []
	if (props.isRequired) validators.push(required())
	if (props.validate) validators.push(...props.validate)
	return validators
}

export function useInputField(props: UseInputFieldProps): UseInputFieldResult {
	//   const validate = useTextValidation(props)
	// We don't want to prefix value with db default,
	// since it might be sql function
	// for example uuid_generate_v4() has invalid regex, but will generate valid uuid,
	// it won't pass validation. So we set it as placeholder
	//   const defaultValue = props.defaultValue ?? ""

	const {
		field,
		id,
		isRequired,
		fieldState: { error, isDirty, isTouched },
	} = useInput({
		source: props.source,
		id: `zmaj_input_${props.id ?? props.source}`,
		defaultValue: props.defaultValue ?? null,
		isRequired: props.isRequired ?? false,
		validate: parseValidators(props),
		//record => input
		format: (value) => {
			const type = props.type ?? "text"

			// custom
			if (props.toInput) return props.toInput(value)

			if (type === "number") {
				return parseInput.number.toInput(value)
			} else if (type === "time") {
				return parseInput.time.toInput(value)
			} else if (type === "date") {
				return parseInput.date.toInput(value)
			} else if (type === "datetime-local") {
				return parseInput["datetime-local"].toInput(value)
			} else {
				return value ?? ""
			}
		},
		// input => record
		parse: (value) => {
			const type = props.type ?? "text"

			if (props.fromInput) return props.fromInput(value)

			if (props.keepEmpty && value === "") return ""

			if (isNil(value) || value === "") return null

			if (type === "number") {
				return parseInput.number.fromInput(value)
			} else if (type === "date") {
				return parseInput.date.fromInput(value)
			} else if (type === "time") {
				return parseInput.time.fromInput(value)
			} else if (type === "datetime-local") {
				return parseInput["datetime-local"].fromInput(value)
			} else {
				return value
			}
		},
	})

	//   const desc = error?.message ?? description ?? ""

	//   const placeholder = isEmpty(props.placeholder) ? undefined : props.placeholder

	//   const { ref, ...rest } = field
	const { ref, ...fieldProps } = field

	return {
		isTouched,
		isDirty,
		isRequired,
		error,
		id,
		field: fieldProps,
		inputRef: ref,
		source: props.source,
		name: props.source,
		label: props.label ?? title(props.source),
		disabled: props.disabled ?? false,
		placeholder: props.placeholder,
		helperText: error?.message ?? props.description ?? " ",
		status: error ? "error" : undefined,
		type: props.type ?? "text",
		className: props.className,
	}
}
export const toInputProps = (props: UseInputFieldResult): InputProps => {
	const {
		error,
		disabled,
		field,
		helperText,
		id,
		inputRef,
		isDirty,
		isRequired,
		isTouched,
		label,
		name,
		source,
		type,
		className,
		placeholder,
		status,
	} = props
	return {
		helperText,
		id,
		label,
		// name,
		// ref: inputRef,
		type,
		className,
		placeholder,
		error: error?.message,
		disabled,
		required: isRequired,
		...field,
	}
	// return props
}
