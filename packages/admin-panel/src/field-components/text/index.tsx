import { allComparisons } from "../all-comparisons"
import { DefineCrudField } from "../DefineCrudField"
import { createTextFieldConfigInput, createTextFieldConfigShow } from "./TextFieldConfig"
import { TextInputField } from "./TextInputField"

export const ShortTextComponents = DefineCrudField({
	name: "short-text",
	Input: TextInputField,
	availableComparisons: allComparisons,
	availableFor: ["short-text", "long-text"],
	InputFieldConfig: createTextFieldConfigInput("short-text"),
	ShowFieldConfig: createTextFieldConfigShow("short-text"),
})
