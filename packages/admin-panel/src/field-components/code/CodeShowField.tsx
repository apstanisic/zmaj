import { memo } from "react"
import { RenderShowField } from "../../shared/show/RenderShowField"
import { ShowFieldProps } from "../types/ShowFieldProps"
import { HighlightCode } from "./HighlightCode"

export type CodeFormatter = (code: string) => string

type CodeShowFieldProps = ShowFieldProps & {
	language?: string
	formatter?: CodeFormatter
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
				<HighlightCode
					code={props.formatter?.(value) ?? value}
					language={language ?? "plaintext"}
				/>
			)}
		/>
	)
})
