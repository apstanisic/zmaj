import { Button } from "@admin-panel/ui/Button"
import { useToggle } from "react-use"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { HighlightCode } from "../code/HighlightCode"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { safeDom } from "./_rich-text-utils"

export function RichTextShowField(props: ShowFieldProps): JSX.Element {
	const [isPreview, togglePreview] = useToggle(true)

	return (
		<RenderShowField
			{...props}
			containerActions={
				<Button small onClick={() => togglePreview()} variant="transparent" className="ml-auto">
					{isPreview ? "Show Raw" : "Show Pretty"}
				</Button>
			}
			render={({ value }) => {
				return isPreview ? (
					<div
						className="prose max-h-[70vh] min-h-[150px] w-full max-w-none  overflow-x-auto overflow-y-auto dark:prose-invert"
						dangerouslySetInnerHTML={{ __html: safeDom(value) }}
					></div>
				) : (
					<HighlightCode
						code={value}
						language="html"
						className="min-h-[150px] overflow-y-auto"
						wrap
					/>
				)
			}}
		/>
	)
}
