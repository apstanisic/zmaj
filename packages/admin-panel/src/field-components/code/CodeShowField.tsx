import { HighlightCode } from "@admin-panel/ui/HighlightedCode"
import { memo } from "react"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"

type CodeShowFieldProps = ShowFieldProps & {
	language?: string
}

/**
 * Show highlighted code
 */
export const CodeShowField = memo((props: CodeShowFieldProps) => {
	const language = props.language ?? props.fieldConfig?.component?.code?.syntaxLanguage

	return (
		<RenderShowField
			{...props}
			render={({ value }) => (
				<HighlightCode code={value} language={language ?? "plaintext"} />
			)}
		/>
	)
})
