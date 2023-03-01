import { DefineCrudField } from "../DefineCrudField"
import { TextInputField } from "../text/TextInputField"
import { KeyValueInputField } from "./KeyValueInputField"
// import { KeyValueInputField } from "./KeyValueInputField"
import { KeyValueShowField } from "./KeyValueShowField"

export const KeyValueComponents = DefineCrudField({
	name: "key-value",
	Input: KeyValueInputField,
	Show: KeyValueShowField,
	SmallInput: TextInputField,
	availableFor: ["json"],
})
