import TipTapImage from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { Underline } from "@tiptap/extension-underline"
import { Content, Editor, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"

/**
 *
 */
export function setRichInputImage(editor: Editor, url: string): void {
	editor.chain().focus().setImage({ src: url }).run()
}

/**
 *
 */
export function useRichEditor(props: {
	disabled?: boolean
	value: Content
	onUpdate: (htmlVal: string) => void
	id: string
}): Editor | null {
	const editor = useEditor({
		// extensions: [...DefaultEditorOptions.extensions, TipTapImage],
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
			TipTapImage,
			Underline,
			Placeholder.configure({ placeholder: "Write here..." }),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Link.configure({}),
		],
		content: props.value,
		editable: props.disabled !== true,
		onUpdate: ({ editor }) => {
			props.onUpdate(editor.getHTML())
			// field.field.onChange({ target: { value: editor.getHTML() } })
		},
		editorProps: {
			attributes: {
				id: props.id,
				class: "prose max-w-none dark:prose-invert focus:outline-none",
			},
		},
	})
	return editor
}

/**
 * Have to reexport all so that I can have proper types (tiptap augments `core` module)
 */
export * from "@tiptap/extension-image"
export * from "@tiptap/extension-link"
export * from "@tiptap/extension-placeholder"
export * from "@tiptap/extension-text-align"
export * from "@tiptap/extension-underline"
// eslint-disable-next-line import/export
export * from "@tiptap/react"
// eslint-disable-next-line import/export
export { EditorContent } from "@tiptap/react"
export * from "@tiptap/starter-kit"
