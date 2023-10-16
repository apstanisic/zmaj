import { Control, Controller } from "react-hook-form"
import { withRhf } from "./StyleVariant"
import { JsonInput } from "./forms/CodeInput/JsonInput"
import { EmailInput } from "./forms/EmailInput"
import { MultilineTextInput } from "./forms/MultilineTextInput"
import { NumberInput } from "./forms/NumberInput"
import { PasswordInput } from "./forms/PasswordInput"
import { SelectInput } from "./forms/SelectInput"
import { SwitchInput } from "./forms/SwitchInput"
import { TextInput } from "./forms/TextInput"
import { UuidInput } from "./forms/UuuidInput"

type Base = { name?: string; defaultValue?: any; isDisabled?: boolean }

/**
 * This components require react-hook-form context, because it's way that react-admin
 * is using it. This is not ideal since it removes name type safety.
 * It also allows manually passing control, but there is currently no type safety for name
 */
function createComponent<TProps extends Base>(
	Component: (props: TProps) => JSX.Element,
): (props: TProps & { name: string; control?: Control<any> }) => JSX.Element {
	const HoC = (props: TProps & { name: string; control?: Control<any> }): JSX.Element => (
		<Controller
			control={props.control}
			name={props.name}
			defaultValue={props.defaultValue}
			disabled={props.isDisabled}
			render={(rProps) => <Component {...withRhf(rProps)} {...(props as TProps)} />}
		/>
	)
	// Name for react dev tools
	HoC.displayName = `Form${Component.name ?? "Unknown"}`
	return HoC
}

export const FormUuidInput = createComponent(UuidInput)
export const FormPasswordInput = createComponent(PasswordInput)
export const FormTextInput = createComponent(TextInput)
export const FormEmailInput = createComponent(EmailInput)
export const FormSelectInput = createComponent(SelectInput)
export const FormNumberInput = createComponent(NumberInput)
export const FormSwitchInput = createComponent(SwitchInput)
export const FormMultilineTextInput = createComponent(MultilineTextInput)
export const FormJsonInput = createComponent(JsonInput)
