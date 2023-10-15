import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { memo, useCallback, useState } from "react"
import { MdAutorenew } from "react-icons/md"
import { Except } from "type-fest"
import { v4 } from "uuid"
import { TextInput, TextInputProps } from "./TextInput"

export type UuidInputProps = Except<TextInputProps, "endIcon" | "type">

export const UuidInput = (props: UuidInputProps): JSX.Element => {
	const [internalValue, setInternalValue] = useState(props.defaultValue ?? "")
	// This has to be controlled input, it's simplest way
	const value = props.value ?? internalValue

	const onChange = useCallback(
		(val: string) => {
			props.onChange ? props.onChange(val) : setInternalValue(val)
		},
		[props],
	)

	return (
		<TextInput
			{...props}
			value={value}
			onChange={onChange}
			endIcon={
				<GenerateUuidButton onPress={() => onChange(v4())} isDisabled={props.isDisabled} />
			}
		/>
	)
}

const GenerateUuidButton = memo(
	({ onPress, isDisabled }: { onPress: () => void; isDisabled?: boolean }) => {
		return (
			<Tooltip text={isDisabled ? "" : "Generate random UUID"} side="left" className="center">
				<IconButton
					aria-label="Generate random UUID"
					onPress={onPress}
					isDisabled={isDisabled}
					size="small"
				>
					<MdAutorenew />
				</IconButton>
			</Tooltip>
		)
	},
)
