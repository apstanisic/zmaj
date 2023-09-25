import { DefineCrudField } from "../DefineCrudField"
import { TextInputField } from "../text/TextInputField"
import { RichTextInputField } from "./RichTextInputField"
import { RichTextListField } from "./RichTextListField"
import { RichTextShowField } from "./RichTextShowField"

// @todo Sanitize html

export const RichTextComponents = DefineCrudField({
	name: "rich-text",
	Input: RichTextInputField,
	List: RichTextListField,
	// Maybe render a button to display pop up
	Show: RichTextShowField,
	SmallInput: TextInputField,
	availableFor: ["text"],
})
