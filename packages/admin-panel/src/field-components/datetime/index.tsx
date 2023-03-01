import { DefineCrudField } from "../DefineCrudField"
import { DateTimeFieldConfigInput, DateTimeFieldConfigShow } from "./DateTimeConfig"
import { DateTimeInputField } from "./DateTimeInputField"
import { DateTimeListField } from "./DateTimeListField"
import { DateTimeShowField } from "./DateTimeShowField"

export const DateTimeComponents = DefineCrudField({
	name: "datetime",
	List: DateTimeListField,
	Input: DateTimeInputField,
	Show: DateTimeShowField,
	InputFieldConfig: DateTimeFieldConfigInput,
	ShowFieldConfig: DateTimeFieldConfigShow,
	availableComparisons: ["$eq", "$ne", "$exists", "$not_exists", "$gte", "$gt", "$lt", "$lte"],
	availableFor: ["datetime"],
})
