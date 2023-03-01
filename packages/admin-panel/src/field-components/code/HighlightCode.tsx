import { clsx } from "clsx"
import { memo, useMemo } from "react"
import { Highlight } from "./highlight"

type HighlightedCodeProps = {
	/**
	 * Programing language. Pass `plaintext` for no highlight
	 */
	language: string
	/**
	 * Code to display
	 */
	code: string
	className?: string
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
		<pre className={clsx(className, wrap && "whitespace-pre-wrap")}>
			{/* Code is escaped, it's safe */}
			<code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted.value }}></code>
		</pre>
	)
})
