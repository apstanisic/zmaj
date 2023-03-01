import { DefineCrudField } from "../DefineCrudField"
import { TextInputField } from "../text/TextInputField"
import { JsonInputField } from "./JsonInputField"
import { JsonShowField } from "./JsonShowField"

export const JsonComponents = DefineCrudField({
	name: "json",
	Input: JsonInputField,
	Show: JsonShowField,
	SmallInput: TextInputField,
	availableFor: ["json"],
})
