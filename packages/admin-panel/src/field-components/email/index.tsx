import { DefineCrudField } from "../DefineCrudField"
import { EmailInputField } from "./EmailInputField"

export const EmailComponents = DefineCrudField({
	name: "email",
	Input: EmailInputField,
	availableFor: ["text"],
})
