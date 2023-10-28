import { inputContainerCss, inputErrorCss } from "@admin-panel/ui/forms/FormControl"
import { getLabelCss } from "@admin-panel/ui/forms/forms-css"
import { cn } from "@admin-panel/utils/cn"
import { Struct, templateParser } from "@zmaj-js/common"
import { useChoicesContext } from "ra-core"
import { title } from "radash"
import { memo, useRef } from "react"
import { Button } from "react-aria-components"
import { useFormContext } from "react-hook-form"

type CurrentValueProps = {
	showPicker: (val: boolean) => unknown
	source: string
	template?: string
	disabled?: boolean
	required?: boolean
	label?: string
	className?: string
}

/**
 */
export const ReferencePickerButton = memo((props: CurrentValueProps) => {
	const {
		source,
		showPicker,
		disabled = false,
		required = false,
		label = title(source),
		template = "{id}",
		className,
	} = props
	const {
		formState: { errors },
		watch,
	} = useFormContext()
	const error = errors[source]?.message?.toString()
	// const { errors } = useFormState()
	const currentValue = watch(source, null) // useWatch({ name: props.fieldName })
	// we are getting selected choice as first item
	// this is whole value that is provided to us by RA
	const selected: Struct | undefined = useChoicesContext().selectedChoices?.[0]

	// button ref is needed so that we can click on label above button and select button
	const buttonRef = useRef<HTMLButtonElement | null>(null)
	const content = templateParser.parse(template, selected, { fallback: currentValue })

	return (
		<div className={cn(inputContainerCss, className)}>
			<p
				onClick={() => buttonRef.current?.focus()}
				aria-hidden
				className={getLabelCss({
					error,
					isDisabled: disabled,
					isRequired: required,
				})}
			>
				{label}
			</p>

			<Button
				ref={buttonRef}
				aria-label={label}
				aria-haspopup="dialog"
				aria-description={error}
				onPress={() => showPicker(true)}
				className={cn("s-input", "h-[52px]")}
			>
				{content}
			</Button>
			{/* TODO Add hint */}
			{/* 			<p></p> */}
			{error && (
				<p aria-hidden className={inputErrorCss}>
					{error}
				</p>
			)}
		</div>
	)
})
