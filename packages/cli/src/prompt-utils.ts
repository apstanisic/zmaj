import { cancel, log } from "@clack/prompts"

export function processExit(code = 0, message?: string, error?: any): never {
	if (error) log.error(JSON.stringify(error, null, 4))
	cancel(message ?? "Operation cancelled.")
	process.exit(code)
}
