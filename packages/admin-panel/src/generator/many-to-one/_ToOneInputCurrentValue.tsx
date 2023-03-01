import { Struct, templateParser } from "@zmaj-js/common"
import { useChoicesContext } from "ra-core"
import { memo, useRef } from "react"
import { useFormState, useWatch } from "react-hook-form"
import { InputWrapper } from "../../ui/InputWrapper"
import { ToOneInternalProps } from "./ToOneInternalProps.type"

type ManyToOneInputCurrentValueProps = Pick<ToOneInternalProps, "label" | "template"> & {
	disabled: boolean
	showPicker: () => unknown
	fieldName: string
	required: boolean
}

/**
 */
export const ToOneInputCurrentValue = memo((props: ManyToOneInputCurrentValueProps) => {
	// const { field } = props
	const currentValue = useWatch({ name: props.fieldName })
	// we are getting selected choice as first item
	// this is whole value that is provided to us by RA
	const selected: Struct | undefined = useChoicesContext().selectedChoices[0]

	// button ref is needed so that we can click on label above button and select button
	const buttonRef = useRef<HTMLButtonElement | null>(null)
	// console.log(props.template, selected, useChoicesContext().selectedChoices)
	const { errors } = useFormState()
	// console.log(errors[props.fieldName]?.message?.toString())

	return (
		<InputWrapper
			label={props.label}
			// disabled={props.disabled}
			required={props.required}
			error={errors[props.fieldName]?.message?.toString()}
			// onLabelClick={}
			labelProps={{ onClick: () => buttonRef.current?.focus() }}
			helpText=" "
		>
			<button
				ref={buttonRef}
				// it's ugly 3.2rem, but I do not want to have 0 width char, because it messes with playwright
				className="input input-select flex h-[3.2rem]"
				type="button"
				onClick={() => {
					if (props.disabled) return
					props.showPicker()
				}}
			>
				{templateParser.parse(props.template, selected, { fallback: currentValue })}
			</button>
		</InputWrapper>
	)
})
