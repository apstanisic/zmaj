import { uuidRegex } from "@zmaj-js/common"
import { DefineCrudField } from "../DefineCrudField"
import { UuidFieldConfigInput, UuidFieldConfigShow } from "./UuidFieldConfig"
import { UuidInputField } from "./UuidInputField"

/**
 * Check to see if right version of uuid is used
 */
function isRightVersion(version?: 1 | 2 | 3 | 4 | 5 | number, message = "Invalid UUID version") {
	return (value: string) => {
		if (!value || !version) return
		return value.charAt(14) !== version.toString() ? message : undefined
	}
}

export const UuidComponents = DefineCrudField({
	name: "uuid",
	Input: UuidInputField,
	availableFor: ["short-text", "long-text", "uuid"],
	validate: ({ field, value }) => {
		const valid = uuidRegex.test(value)
		if (!valid) return "Invalid UUID"
		const requiredVersion = field?.fieldConfig?.component?.uuid?.version
		if (!requiredVersion) return
		return isRightVersion(requiredVersion)(value) ? "Invalid UUID version" : undefined
	},
	InputFieldConfig: UuidFieldConfigInput,
	ShowFieldConfig: UuidFieldConfigShow,
})
