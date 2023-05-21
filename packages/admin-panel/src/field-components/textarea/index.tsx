import { allComparisons } from "../all-comparisons"
import { DefineCrudField } from "../DefineCrudField"
import { createTextFieldConfigInput, createTextFieldConfigShow } from "../text/TextFieldConfig"
import { TextInputField } from "../text/TextInputField"
import { TextareaInputField } from "./TextareaInputField"

export const TextareaComponents = DefineCrudField({
	name: "long-text",
	Input: TextareaInputField,
	SmallInput: TextInputField,
	availableComparisons: allComparisons,
	InputFieldConfig: createTextFieldConfigInput("long-text"),
	ShowFieldConfig: createTextFieldConfigShow("long-text"),
	availableFor: ["text"],
})
