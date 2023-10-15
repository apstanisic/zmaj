import { Button } from "@admin-panel/ui/buttons/Button"
import ReactMarkdown from "react-markdown"
import { useToggle } from "react-use"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { HighlightCode } from "../code/HighlightCode"
import { ShowFieldProps } from "../types/ShowFieldProps"

export function MarkdownShowField(props: ShowFieldProps): JSX.Element {
	const [isPreview, togglePreview] = useToggle(true)

	return (
		<RenderShowField
			{...props}
			containerActions={
				<Button
					size="small"
					onPress={() => togglePreview()}
					color="transparent"
					className="ml-auto"
				>
					{isPreview ? "Show text" : "Show Markdown"}
				</Button>
			}
			render={({ value }) =>
				isPreview ? (
					<div className="prose-sm max-h-[400px]">
						<ReactMarkdown>{value}</ReactMarkdown>
					</div>
				) : (
					<div className="max-h-[400px]">
						<HighlightCode code={value} language="markdown" />
					</div>
				)
			}
		/>
	)
}
