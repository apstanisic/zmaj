export function extractUrl(text?: string): string | undefined {
	return text?.match(/\bhttps?:\/\/\S+/gi)?.[0]
}
