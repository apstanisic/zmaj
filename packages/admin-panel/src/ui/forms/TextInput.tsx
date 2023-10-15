import { cn } from "@admin-panel/utils/cn"
import { ReactNode } from "react"
import { Input, TextField, TextFieldProps } from "react-aria-components"
import { FormControl } from "./FormControl"
import { getInputBoxCss, inputCss } from "./forms-css"

export type TextInputProps = TextFieldProps & {
	label?: string
	description?: string
	error?: string
	placeholder?: string
	//
	startIcon?: ReactNode
	endIcon?: ReactNode
	//
	className?: string
}

export const TextInput = (props: TextInputProps) => {
	// do not pass id currently, it causes error
	const { label, description, error, placeholder, startIcon, id, endIcon, ...raProps } = props

	return (
		<TextField {...raProps} className={cn("my-1", props.className)}>
			<FormControl {...props}>
				<div className={getInputBoxCss(props)}>
					{startIcon && (
						<div className={cn("center p-1 pl-2", error && "text-error")}>
							{startIcon}
						</div>
					)}
					<Input
						// do not show placeholder when input is disabled
						placeholder={props.isDisabled ? undefined : placeholder}
						className={inputCss}
						id={undefined}
					/>
					{endIcon && (
						<div className={cn("center p-1 pr-2", error && "text-error")}>
							{endIcon}
						</div>
					)}
				</div>
			</FormControl>
		</TextField>
	)
}
