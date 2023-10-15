import { cn } from "@admin-panel/utils/cn"
import { TextArea, TextField, TextFieldProps } from "react-aria-components"
import { FormControl } from "./FormControl"
import { getInputBoxCss, inputCss } from "./forms-css"

export type MultilineTextInputProps = TextFieldProps & {
	label?: string
	description?: string
	error?: string
	placeholder?: string
	//
	className?: string
	lines?: number
}

export function MultilineTextInput(props: MultilineTextInputProps): JSX.Element {
	const { label, description, error, placeholder, lines: lines = 5, ...raProps } = props

	return (
		<TextField {...raProps} className={cn("my-1", props.className)}>
			<FormControl
				description={description}
				error={error}
				label={label}
				isRequired={raProps.isRequired}
			>
				<div className={cn(getInputBoxCss(props))}>
					<TextArea
						// do not show placeholder when input is disabled
						rows={lines}
						placeholder={props.isDisabled ? undefined : placeholder}
						className={inputCss}
					/>
				</div>
			</FormControl>
		</TextField>
	)
}
