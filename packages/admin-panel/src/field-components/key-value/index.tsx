import { DefineCrudField } from "../DefineCrudField"
import { JsonInputField } from "../json/JsonInputField"
import { TextInputField } from "../text/TextInputField"
import { KeyValueShowField } from "./KeyValueShowField"

export const KeyValueComponents = DefineCrudField({
	name: "key-value",
	Input: JsonInputField,
	Show: KeyValueShowField,
	SmallInput: TextInputField,
	availableFor: ["json"],
})
