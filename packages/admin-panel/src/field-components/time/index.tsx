import { DefineCrudField } from "../DefineCrudField"
import { TimeInputField } from "./TimeInputField"
import { TimeListField } from "./TimeListField"
import { TimeShowField } from "./TimeShowField"

export const TimeComponents = DefineCrudField({
	name: "time",
	List: TimeListField,
	Input: TimeInputField,
	Show: TimeShowField,
	availableFor: ["time"],
})
