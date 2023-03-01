import { DefineCrudField } from "../DefineCrudField"
import { DateInputField } from "./DateInputField"
import { DateListField } from "./DateListField"
import { DateShowField } from "./DateShowField"

export const DateComponents = DefineCrudField({
	name: "date",
	List: DateListField,
	Input: DateInputField,
	Show: DateShowField,
	availableFor: ["date"],
	availableComparisons: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$exists", "$not_exists"],
})
