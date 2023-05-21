import { allComparisons } from "../all-comparisons"
import { DefineCrudField } from "../DefineCrudField"
import { TextInputField } from "../text/TextInputField"
import { MarkdownInputField } from "./MarkdownInputField"
import { MarkdownShowField } from "./MarkdownShowField"

export const MarkdownComponents = DefineCrudField({
	name: "markdown",
	Input: MarkdownInputField,
	Show: MarkdownShowField,
	SmallInput: TextInputField,
	availableComparisons: allComparisons,
	availableFor: ["text"],
})
