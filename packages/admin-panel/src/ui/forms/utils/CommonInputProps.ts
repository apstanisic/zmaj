import { MultilineTextInputProps } from "../MultilineTextInput"
import { NumberInputProps } from "../NumberInput"
import { PasswordInputProps } from "../PasswordInput"
import { SelectInputProps } from "../SelectInput"
import { SwitchInputProps } from "../SwitchInput"
import { TextInputProps } from "../TextInput"
import { UuidInputProps } from "../UuuidInput"

export type CommonInputProps =
	| TextInputProps
	| SelectInputProps
	| PasswordInputProps
	| NumberInputProps
	| UuidInputProps
	| SwitchInputProps
	| MultilineTextInputProps
