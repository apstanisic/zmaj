import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { EditorContent, useRichEditor } from "@zmaj-js/rich-input"
import { clsx } from "clsx"
import { memo, useMemo, useState } from "react"
import { useSdk } from "../../context/sdk-context"
import { getFieldWidthCss } from "../../crud-layouts/get-field-width-css"
import { FilePickerDialog } from "../../pages/files/components/FilePickerDialog"
import { useInputField } from "../../shared/input/useInputField"
import { getImageUrl } from "../../ui/display-file"
import { InputWrapper } from "../../ui/InputWrapper"
import { InputFieldProps } from "../types/InputFieldProps"
import { RichTextToolbar } from "./_RichTextInputToolbar"

/**
 * Rich Text Input (wysiwyg)
 *
 * I'm using toolbar from react-admin's implementation. But I'm using my handling editor instance.
 * By creating editor manually and using react-admin's context, toolbar can be used without relaying
 * on main component. This way, I don't have to create basic button and to install all extensions
 * manually. Main reason for separate component is that it looks out of place, and it can't be fixed
 * with main component. Only new feature is ability to upload/pick images.
 * Label is always small since it collides with toolbar
 */
export const RichTextInputField = memo((props: InputFieldProps) => {
	const width = useMemo(() => getFieldWidthCss(12), [])
	const sdk = useSdk()
	const [pickerOpen, setPickerOpen] = useState(false)

	const validate = useStringValidation(props.fieldConfig?.component?.richText, props.validate)
	const field = useInputField({ ...props, validate })

	const editor = useRichEditor({
		disabled: props.disabled,
		id: field.id,
		onUpdate(htmlVal) {
			field.field.onChange({ target: { value: htmlVal } })
		},
		value: field.field.value,
		//
	})

	if (editor === null) return <></>

	return (
		<div className={clsx(props.className, "min-h-[300px] w-full ", width)}>
			<EditorContent editor={editor}>
				<>
					<FilePickerDialog
						open={pickerOpen}
						onClose={() => setPickerOpen(false)}
						onPick={(images) => {
							setPickerOpen(false)
							images.map((img) => {
								const url = getImageUrl(sdk, img.id)
								// setRichInputImage(editor, url)
								editor.chain().focus().setImage({ src: url }).run()
							})
						}}
					/>
					<InputWrapper
						label={props.label}
						// className={clsx(width, "flex flex-col")}
						required={field.isRequired}
						// disabled={field.disabled}
						labelProps={{
							onClick: () => editor?.chain().focus().run(),
						}}
					>
						<div
							id={`wrapper_${field.id}`}
							onClick={() => editor?.chain().focus().run()}
							className={clsx("input")}
						>
							<div className="flex flex-wrap pb-3">
								<RichTextToolbar editor={editor} openPicker={() => setPickerOpen(true)} />
							</div>
							<EditorContent editor={editor} className="relative min-h-[250px] w-full" />
						</div>
					</InputWrapper>
				</>
			</EditorContent>
		</div>
	)
})
