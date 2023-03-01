import { Editor } from "@zmaj-js/rich-input"
import { clsx } from "clsx"
import {
	MdAddLink,
	MdAddPhotoAlternate,
	MdCode,
	MdFormatAlignCenter,
	MdFormatAlignJustify,
	MdFormatAlignLeft,
	MdFormatAlignRight,
	MdFormatBold,
	MdFormatClear,
	MdFormatItalic,
	MdFormatListBulleted,
	MdFormatListNumbered,
	MdFormatQuote,
	MdFormatStrikethrough,
	MdFormatUnderlined,
} from "react-icons/md"
import { Select } from "../../ui/Select"

// type Editor = NonNullable<ReturnType<typeof useRichEditor>>

function TextButton(props: {
	active: boolean
	onClick: () => any
	icon: (props: { fontSize?: "small" }) => JSX.Element
	disabled?: boolean
}): JSX.Element {
	const Icon = props.icon
	return (
		<button
			disabled={props.disabled}
			type="button"
			onClick={props.onClick}
			className={clsx(
				props.active && "bg-gray-200 dark:bg-gray-700",
				"s-input center aspect-square p-2 text-xs text-gray-700 disabled:opacity-50 ",
				"dark:text-white",
			)}
		>
			<Icon fontSize="small" />
			{/* {props.icon} */}
		</button>
	)
}

type Props = { editor?: null | Editor; openPicker: () => void }

export const RichTextToolbar = ({ editor, openPicker }: Props): JSX.Element => {
	if (!editor) {
		return <></>
	}

	return (
		<div className="flex flex-wrap gap-2">
			<Marks editor={editor} />
			<Align editor={editor} />
			<Headings editor={editor} />
			<List editor={editor} />
			<Media editor={editor} openPicker={openPicker} />

			<div>
				{/* Clear */}
				<TextButton
					icon={MdFormatClear}
					onClick={() => editor.chain().focus().unsetAllMarks().run()}
					active={false}
				/>
			</div>
		</div>
	)
}

function Media({ editor, openPicker }: { openPicker: () => void; editor: Editor }): JSX.Element {
	return (
		<div className="flex h-10">
			<TextButton
				icon={MdAddLink}
				onClick={() => {
					const value = prompt("Enter URL")
					if (!value) return
					editor.chain().focus().toggleLink({ href: value, target: "_blank" }).run()
				}}
				active={false}
				disabled={editor.state.selection.empty}
			/>
			<TextButton icon={MdAddPhotoAlternate} onClick={() => openPicker()} active={false} />
		</div>
	)
}

function List({ editor }: { editor: Editor }): JSX.Element {
	return (
		<div className="flex h-10">
			<TextButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				active={editor.isActive("bulletList")}
				icon={MdFormatListBulleted}
			/>
			<TextButton
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				active={editor.isActive("orderedList")}
				icon={MdFormatListNumbered}
			/>
		</div>
	)
}

function Marks({ editor }: { editor: Editor }): JSX.Element {
	return (
		<div className="flex h-10">
			<TextButton
				onClick={() => editor.chain().focus().toggleBold().run()}
				active={editor.isActive("bold")}
				icon={MdFormatBold}
			/>
			<TextButton
				onClick={() => editor.chain().focus().toggleItalic().run()}
				active={editor.isActive("italic")}
				icon={MdFormatItalic}
			/>

			<TextButton
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				active={editor.isActive("blockquote")}
				icon={MdFormatQuote}
			/>

			<TextButton
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				active={editor.isActive("underline")}
				icon={MdFormatUnderlined}
			/>

			<TextButton
				onClick={() => editor.chain().focus().toggleStrike().run()}
				active={editor.isActive("strike")}
				icon={MdFormatStrikethrough}
			/>

			<TextButton
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				active={editor.isActive("codeBlock")}
				icon={MdCode}
			/>
		</div>
	)
}

function Align({ editor }: { editor: Editor }): JSX.Element {
	return (
		<div className="flex h-10">
			<TextButton
				onClick={() => editor.chain().focus().setTextAlign("left").run()}
				active={editor.isActive({ textAlign: "left" })}
				icon={MdFormatAlignLeft}
			/>
			<TextButton
				onClick={() => editor.chain().focus().setTextAlign("center").run()}
				active={editor.isActive({ textAlign: "center" })}
				icon={MdFormatAlignCenter}
			/>
			<TextButton
				onClick={() => editor.chain().focus().setTextAlign("right").run()}
				active={editor.isActive({ textAlign: "right" })}
				icon={MdFormatAlignRight}
			/>

			<TextButton
				onClick={() => editor.chain().focus().setTextAlign("justify").run()}
				active={editor.isActive({ textAlign: "justify" })}
				icon={MdFormatAlignJustify}
			/>
		</div>
	)
}

function Headings({ editor }: { editor: Editor }): JSX.Element {
	return (
		<div className=" flex h-10 w-32">
			<Select
				choices={(["Normal", 1, 2, 3, 4] as const).map((value) => ({
					value,
					label: value === "Normal" ? value : `Heading ${value}`,
				}))}
				buttonProps={{ className: "w-full py-0.5 !h-10 " }}
				// buttonClassName="p-1.5"
				className="h-10"
				hideRequiredSign
				name="headingLevel"
				value={editor.getAttributes("heading")?.["level"] ?? "Normal"}
				required
				onChange={(level: "Normal" | 1 | 2 | 3 | 4) => {
					if (level === "Normal") {
						return editor.chain().focus().setParagraph().run()
					}
					return editor.chain().focus().toggleHeading({ level }).run()
				}}
			/>
		</div>
	)
}
