import { DefineCrudField } from "../DefineCrudField"
import { IntFieldConfigInput, IntFieldConfigShow } from "./IntFieldConfig"
import { IntInputField } from "./IntInputField"

export const IntComponents = DefineCrudField({
	name: "int",
	Input: IntInputField,
	availableComparisons: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$exists", "$not_exists"],
	availableFor: ["int"],
	InputFieldConfig: IntFieldConfigInput,
	ShowFieldConfig: IntFieldConfigShow,
})
