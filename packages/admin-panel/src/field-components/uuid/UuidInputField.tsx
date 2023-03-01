import { DefaultInputField } from "@admin-panel/shared/input/DefaultInputField"
import { IconButton } from "@admin-panel/ui/IconButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { isIn, uuidRegex } from "@zmaj-js/common"
import { regex, Validator } from "ra-core"
import { memo, useCallback, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MdAutorenew } from "react-icons/md"
import { v1, v4 } from "uuid"
import { InputFieldProps } from "../types/InputFieldProps"

export const UuidInputField = (props: InputFieldProps): JSX.Element => {
	const { setValue } = useFormContext()

	// Must be specific uuid version
	const requiredVersion = props.fieldConfig?.component?.uuid?.version

	// Supported only v1, v4, they are most commonly used
	const showGenerator = useMemo(
		() => isIn(requiredVersion, [1, 4, undefined, null]) && props.disabled !== true,
		[props.disabled, requiredVersion],
	)

	const generateUuid = useCallback(() => {
		setValue(props.source, requiredVersion === 1 ? v1() : v4())
	}, [setValue, props.source, requiredVersion])

	const validate = useMemo(
		() => [
			...(props.validate ?? []),
			regex(uuidRegex, "Invalid UUID"),
			isRightVersion(requiredVersion),
		],
		[props.validate, requiredVersion],
	)

	return (
		<DefaultInputField
			{...props}
			validate={validate}
			customProps={{
				endIcon: showGenerator ? <GenerateUuidButton onClick={generateUuid} /> : undefined,
			}}
		/>
	)
}

const GenerateUuidButton = memo(({ onClick }: { onClick: () => void }) => {
	return (
		// <InputAdornment position="end">
		<Tooltip text="Generate random UUID " side="left" className="center">
			<IconButton label="Generate random UUID" onClick={onClick}>
				<MdAutorenew />
			</IconButton>
		</Tooltip>
		// </InputAdornment>
	)
})

/**
 * Check to see if right version of uuid is used
 */
const isRightVersion = (
	version?: 1 | 2 | 3 | 4 | 5 | number,
	message = "Invalid UUID version",
): Validator => {
	return (value: string) => {
		if (!value || !version) return
		return value.charAt(14) !== version.toString() ? message : undefined
	}
}
