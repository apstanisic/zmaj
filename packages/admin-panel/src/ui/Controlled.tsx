import { Controller } from "react-hook-form"
import { withRhf } from "./StyleVariant"
import { EmailInput } from "./forms/EmailInput"
import { MultilineTextInput } from "./forms/MultilineTextInput"
import { NumberInput } from "./forms/NumberInput"
import { PasswordInput } from "./forms/PasswordInput"
import { SelectInput } from "./forms/SelectInput"
import { SwitchInput } from "./forms/SwitchInput"
import { TextInput } from "./forms/TextInput"
import { UuidInput } from "./forms/UuuidInput"

type Base = { name?: string; defaultValue?: any; isDisabled?: boolean }

function createComponent<TProps extends Base>(
	Component: (props: TProps) => JSX.Element,
): (props: TProps & { name: string }) => JSX.Element {
	return (props: TProps & { name: string }) => (
		<Controller
			name={props.name}
			defaultValue={props.defaultValue}
			disabled={props.isDisabled}
			render={(rProps) => <Component {...withRhf(rProps)} {...(props as TProps)} />}
		/>
	)
}

export const FormUuidInput = createComponent(UuidInput)
export const FormPasswordInput = createComponent(PasswordInput)
export const FormTextInput = createComponent(TextInput)
export const FormEmailInput = createComponent(EmailInput)
export const FormSelectInput = createComponent(SelectInput)
export const FormNumberInput = createComponent(NumberInput)
export const FormSwitchInput = createComponent(SwitchInput)
export const FormMultilineTextInput = createComponent(MultilineTextInput)
