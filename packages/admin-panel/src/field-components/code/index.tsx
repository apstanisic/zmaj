import { DefineCrudField } from "../DefineCrudField"
import { TextInputField } from "../text/TextInputField"
import { CodeFieldConfigInput, CodeFieldConfigShow } from "./CodeFieldConfig"
import { CodeInputField } from "./CodeInputField"
import { CodeShowField } from "./CodeShowField"

export const CodeComponents = DefineCrudField({
	name: "code",
	Input: CodeInputField,
	SmallInput: TextInputField,
	Show: CodeShowField,
	availableFor: ["text"],
	InputFieldConfig: CodeFieldConfigInput,
	ShowFieldConfig: CodeFieldConfigShow,
})
