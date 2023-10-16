import { cn } from "@admin-panel/utils/cn"
import { memo, useMemo } from "react"
import { Highlight } from "./forms/CodeInput/highlight.lib"

type HighlightedCodeProps = {
	className?: string
	/**
	 * Programming language. Pass `plaintext` for no highlight
	 */
	language: string
	/**
	 * Code to display
	 */
	code: string
	/**
	 * Should we wrap lines
	 */
	wrap?: boolean
}

/**
 * @todo Add dark theme
 */
export const HighlightCode = memo((props: HighlightedCodeProps) => {
	const { code, language, className, wrap } = props
	// const [theme] = useTheme()
	// const mode = theme?.palette?.mode === "dark" ? "dark" : "light"

	const highlighted = useMemo(
		() => Highlight.highlight(code, { language, ignoreIllegals: true }),
		[code, language],
	)

	return (
		<pre className={cn(wrap && "whitespace-pre-wrap", className)}>
			{/* Code is escaped, it's safe */}
			<code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted.value }}></code>
		</pre>
	)
})
