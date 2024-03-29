import { cn } from "@admin-panel/utils/cn"
import { Input, Label, NumberField, NumberFieldProps, Text } from "react-aria-components"
import { TbMinus, TbPlus } from "react-icons/tb"
import { IconButton } from "../buttons/IconButton"
import { getInputBoxCss, getLabelCss, inputCss } from "./forms-css"

export type NumberInputProps = NumberFieldProps & {
	label?: string
	description?: string
	error?: string
	placeholder?: string
	//
	className?: string
	hideButtons?: boolean
}

export function NumberInput(props: NumberInputProps): JSX.Element {
	const { label, description, error, placeholder, hideButtons, ...raProps } = props

	return (
		<NumberField
			formatOptions={{ useGrouping: false }}
			{...raProps}
			className={cn("my-1", props.className)}
		>
			{label && <Label className={getLabelCss(props)}>{label}</Label>}
			<div className={getInputBoxCss(props)}>
				<Input
					// do not show placeholder when input is disabled
					placeholder={props.isDisabled ? undefined : placeholder}
					className={inputCss}
				/>
				<div className={cn("flex flex-row gap-2 mr-2 center", hideButtons && "sr-only")}>
					<IconButton slot="decrement" aria-label="Increment" size="small">
						<TbMinus />
					</IconButton>
					<div role="separator" className={cn("w-px h-2/3 bg-base-300 center")} />
					<IconButton slot="increment" aria-label="Decrement" size="small">
						<TbPlus />
					</IconButton>
				</div>
			</div>
			{description && !error && (
				<Text slot="description" className="text-sm text-neutral/70">
					{description}
				</Text>
			)}
			{error && (
				<Text slot="errorMessage" className="text-sm text-error">
					{error}
				</Text>
			)}
		</NumberField>
	)
}
