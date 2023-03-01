import { DefineCrudField } from "../DefineCrudField"
import { NumberFieldConfigInput, NumberFieldConfigShow } from "./NumberFieldConfig"
import { NumberInputField } from "./NumberInputField"
import { NumberListField } from "./NumberListField"

export const FloatComponents = DefineCrudField({
	name: "float",
	Input: NumberInputField,
	List: NumberListField,
	availableComparisons: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$exists", "$not_exists"],
	availableFor: ["float"],
	InputFieldConfig: NumberFieldConfigInput,
	ShowFieldConfig: NumberFieldConfigShow,
})
