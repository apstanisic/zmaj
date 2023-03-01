import { useObjectRef } from "@react-aria/utils"
import { useToggleState } from "@react-stately/toggle"
import { clsx } from "clsx"
import { forwardRef } from "react"
import { AriaToggleButtonProps, useToggleButton } from "react-aria"
import { SetRequired } from "type-fest"

type ToggleButtonProps = SetRequired<AriaToggleButtonProps, "aria-label">

/**
 * Not same as switch
 * @see https://github.com/adobe/react-spectrum/issues/1264
 */
export const ToggleButton = forwardRef<any, ToggleButtonProps>((props, ref) => {
	const domRef = useObjectRef(ref)
	const state = useToggleState(props)

	const { buttonProps } = useToggleButton(props, state, domRef)
	return (
		<button
			// i do not know if this is valid for aria, but it's only way that daisy ui supports
			aria-checked={state.isSelected}
			{...buttonProps}
			className={clsx(
				"du-toggle-primary du-toggle du-toggle-lg mt-1", //
			)}
			ref={domRef}
		></button>
	)
})
