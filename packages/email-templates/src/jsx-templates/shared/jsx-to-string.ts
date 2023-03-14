import { renderToMjml } from "@faire/mjml-react/utils/renderToMjml.js"
import mjml2html from "mjml"
import { ReactElement } from "react"

export function jsxToString(element: ReactElement): string {
	const result = mjml2html(renderToMjml(element))
	if (result.errors.length > 0) throw result.errors[0]
	return result.html
}
