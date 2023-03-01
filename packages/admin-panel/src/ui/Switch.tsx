import { useObjectRef } from "@react-aria/utils"
import { useToggleState } from "@react-stately/toggle"
import { notNil } from "@zmaj-js/common"
import { clsx } from "clsx"
import { forwardRef, useEffect } from "react"
import { AriaSwitchProps, useFocusRing, useSwitch } from "react-aria"
import { Except } from "type-fest"
import { CustomInputProps } from "./Input"
import { InputWrapper } from "./InputWrapper"

type Params = AriaSwitchProps &
	Except<CustomInputProps, "end" | "start"> & {
		required?: boolean
		className?: string
	}

/**
 * Not same as toggle button
 * @see https://github.com/adobe/react-spectrum/issues/1264
 */
export const Switch = forwardRef<any, Params>((props, ref) => {
	const state = useToggleState(props)
	const domRef = useObjectRef(ref)
	const { inputProps } = useSwitch({ ...props, children: props.label }, state, domRef)
	const { focusProps } = useFocusRing()

	useEffect(() => {
		if (!props.required) return
		if (notNil(props.isSelected)) return
		props.onChange?.(false)
	}, [props, props.isSelected, props.required])

	return (
		<InputWrapper
			helpText={props.helperText}
			required={props.required}
			className={clsx(props.className, props.error && "err")}
			label={props.label}
			error={props.error}
			labelPosition={props.labelPosition}
			labelProps={{ hideRequiredSign: props.hideRequiredSign }}
			id={inputProps.id}
		>
			<input
				{...inputProps}
				{...focusProps}
				ref={domRef}
				className={clsx("du-toggle-primary du-toggle du-toggle-lg mt-1")}
			/>
		</InputWrapper>
	)
})
