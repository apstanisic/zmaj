import { useState } from "react"
// import { InputWrapper } from "../../ui/InputWrapper"
// import { ToOneInternalProps } from "./ToOneInternalProps.type"
import { ReferencePickerButton } from "@admin-panel/relation-components/shared/ReferencePickerButton"
import { ReferencesPickerDialog } from "@admin-panel/relation-components/shared/ReferencePickerDialog"
import { useFormContext } from "react-hook-form"
import { ManyToOneReferenceInput } from "./ManyToOneReferenceInput"

type ManyToOneInputFieldProps = {
	source: string
	reference: string
	label?: string
	disabled?: boolean
	template?: string
	className: string
}

export function ManyToOneInputField(props: ManyToOneInputFieldProps): JSX.Element {
	const { source, reference, label, disabled, template, className } = props
	const [show, setShow] = useState(false)
	const { setValue } = useFormContext()
	return (
		<>
			<ManyToOneReferenceInput source={source} reference={reference}>
				<ReferencePickerButton
					showPicker={setShow}
					source={source}
					label={label}
					disabled={disabled}
					template={template}
					className={className}
				/>
				<ReferencesPickerDialog
					setShow={setShow}
					show={show}
					template={template}
					onSelect={(record) =>
						setValue(source, record.id, { shouldTouch: true, shouldDirty: true })
					}
				/>
			</ManyToOneReferenceInput>
		</>
	)
}

type CurrentValueProps = {
	showPicker: () => unknown
	source: string
	disabled?: boolean
	required?: boolean
	label?: string
	template?: string
}

/**
 */
// const CurrentValue = memo((props: CurrentValueProps) => {
// 	const {
// 		disabled = false,
// 		required = false,
// 		source,
// 		label = title(source),
// 		template = "{id}",
// 	} = props
// 	const {
// 		formState: { errors },
// 		watch,
// 	} = useFormContext()
// 	const error = errors[source]?.message?.toString()
// 	// const { errors } = useFormState()
// 	const currentValue = watch(source, null) // useWatch({ name: props.fieldName })
// 	// we are getting selected choice as first item
// 	// this is whole value that is provided to us by RA
// 	const selected: Struct | undefined = useChoicesContext().selectedChoices[0]

// 	// button ref is needed so that we can click on label above button and select button
// 	const buttonRef = useRef<HTMLButtonElement | null>(null)
// 	const content = templateParser.parse(template, selected, { fallback: currentValue })

// 	return (
// 		<>
// 		<div className={inputContainerCss}>
// 			<p
// 				aria-hidden
// 				className={getLabelCss({
// 					error,
// 					isDisabled: disabled,
// 					isRequired: required,
// 				})}
// 			>
// 				{label}
// 			</p>

// 			<Button aria-label={label} aria-haspopup="dialog" aria-description={error}>
// 				{content}
// 			</Button>
// 			{/* TODO Add hint */}
// 			{/* 			<p></p> */}
// 			{error && (
// 				<p aria-hidden className={inputErrorCss}>
// 					{error}
// 				</p>
// 			)}
// 		</div>
// 	)
// })
