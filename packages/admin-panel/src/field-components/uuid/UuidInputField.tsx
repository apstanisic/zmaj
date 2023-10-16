import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { UuidInput, UuidInputProps } from "@admin-panel/ui/forms/UuuidInput"
import { uuidRegex } from "@zmaj-js/common"
import { regex } from "ra-core"
import { useMemo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

export const UuidInputField = (props: InputFieldProps): JSX.Element => {
	const validate = useMemo(
		() => [...(props.validate ?? []), regex(uuidRegex, "Invalid UUID")],
		[props.validate],
	)
	const asProps = useInputAdapter<UuidInputProps>(props, { validate })

	return <UuidInput {...asProps} />
}
