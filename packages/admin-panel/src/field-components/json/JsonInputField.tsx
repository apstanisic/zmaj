import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { JsonInput } from "@admin-panel/ui/forms/CodeInput/JsonInput"
import { ignoreErrors } from "@zmaj-js/common"
import { useInput } from "ra-core"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

// /**
//  * Debounce, cause parsing json on every keystroke is getting more expensive with every char
//  * @param val JSON string
//  * @param cb Callback that will be called when checking is complete
//  */
// const debounceValidJson = debounce((val: string, cb: (valid: boolean) => any) => {
//   const valid = isValidJson(val);
//   cb(valid);
// }, 500);

// /**
//  * Adopted debounced JSON checking for react-admin validate
//  * @todo Include this when RA switches from react-final-form because rff validates
//  * everything on every change, and json validation is expensive
//  * Currently it works on change, but it prevents submit for some reason
//  */
// function raValidJson(value: string): Promise<string | undefined> {
//   // return wait(500).then(() => undefined);

//   return new Promise((res) => {
//     console.log('called in promise');
//     debounceValidJson(value, (valid) => (valid ? res(undefined) : res('Invalid JSON')));
//   });
// }

/**
 * Can't debounce in react-final-form, so only check short json
 */
// function tempRaValidJson(value?: string): string | undefined {
//   if (!value || value.length > 1000) return undefined
//   return isValidJson(value) ? undefined : "Invalid JSON"
// }

const formatJson = (val: string): string =>
	ignoreErrors(() => JSON.stringify(JSON.parse(val), null, 4)) ?? val
/**
 * JSON input component
 *
 * @todo Add JSON validation
 *
 * @param props Standard input props
 * @returns Rendered component
 */
export const JsonInputField = memo((props: InputFieldProps) => {
	const validate = useStringValidation(props.fieldConfig?.component?.json, props.validate)

	const {
		field: { ref, ...field },
		fieldState: { error },
		isRequired,
		id,
	} = useInput({
		source: props.source,
		defaultValue: props.defaultValue,
		control: props.control,
		disabled: props.disabled,
		isRequired: props.isRequired,
		validate,
	})

	return (
		<JsonInput
			{...field}
			isDisabled={field.disabled}
			id={id}
			className={props.className}
			description={props.description ?? undefined}
			isRequired={isRequired}
			error={error?.message}
			label={props.label}
		/>
	)
})
