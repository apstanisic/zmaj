import { templateParser, TemplateParserPipe } from "@zmaj-js/common"
import { useEffect } from "react"

type Pipe = { key: string; fn: TemplateParserPipe }
/**
 * This hook is used to register components
 */
export function useRegisterTemplatePipes(pipes: Pipe[] = []): void {
	useEffect(() => {
		for (const pipe of pipes) {
			templateParser.addPipe(pipe.key, pipe.fn)
		}
	}, [pipes])
}
