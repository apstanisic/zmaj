import { DefineCrudField } from "../DefineCrudField"
import { DropdownInputConfig, DropdownShowConfig } from "./DropdownFieldConfig"
import { DropdownInputField } from "./DropdownInputField"

export const DropdownComponents = DefineCrudField({
	name: "dropdown",
	Input: DropdownInputField,
	availableFor: ["short-text", "long-text"],
	InputFieldConfig: DropdownInputConfig,
	ShowFieldConfig: DropdownShowConfig,
	validate: ({ field, value }) => {
		const exist = field.fieldConfig?.component?.dropdown?.choices?.find(
			(option) => option.value === value,
		)
		if (!exist) return "Unavailable value."
		return
	},
})
