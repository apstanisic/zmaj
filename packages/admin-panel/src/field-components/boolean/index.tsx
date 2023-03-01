import { DefineCrudField } from "../DefineCrudField"
import { BooleanInputField } from "./BooleanInputField"
import { BooleanListField } from "./BooleanListField"
import { BooleanShowField } from "./BooleanShowField"

export const BooleanComponents = DefineCrudField({
	name: "boolean",
	Show: BooleanShowField,
	Input: BooleanInputField,
	List: BooleanListField,
	availableFor: ["boolean"],
})
