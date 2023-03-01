import { allComparisons } from "../all-comparisons"
import { DefineCrudField } from "../DefineCrudField"
import { createTextFieldConfigInput, createTextFieldConfigShow } from "../text/TextFieldConfig"
import { UrlInputField } from "./UrlInputField"
import { UrlListField } from "./UrlListField"
import { UrlShowField } from "./UrlShowField"

export const UrlComponents = DefineCrudField({
	name: "url",
	availableComparisons: allComparisons,
	List: UrlListField,
	Show: UrlShowField,
	Input: UrlInputField,
	SmallInput: UrlInputField,
	InputFieldConfig: createTextFieldConfigInput("url"),
	ShowFieldConfig: createTextFieldConfigShow("url"),
	availableFor: ["short-text", "long-text"],
})
