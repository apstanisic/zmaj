import { DefineCrudField } from "../DefineCrudField"
import { PasswordInputField } from "./PasswordInputField"
import { PasswordListField } from "./PasswordListField"
import { PasswordShowField } from "./PasswordShowField"

export const PasswordComponents = DefineCrudField({
	name: "password",
	Show: PasswordShowField,
	Input: PasswordInputField,
	List: PasswordListField,
	availableFor: ["short-text", "long-text"],
})
