import DOMPurify from "dompurify"

export function safeDom(value: unknown, options?: { stripTags?: boolean }): string {
	if (options?.stripTags) {
		// Artificially add space to tags, so that when tags are stripped, text does not become one word
		// Before: `<b>hello</b><i>world</i>` => `helloworld`
		// After: `<b> hello</b> <i> world</i>` => `hello world`
		const stringValue = String(value ?? "")
			.replaceAll(">", "> ")
			.trim()
		return DOMPurify.sanitize(stringValue, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
			USE_PROFILES: { html: true },
		})
	}

	return DOMPurify.sanitize(String(value ?? ""), {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ["form", "button", "input"],
		// maybe allow in the future, but for now it's safer this way
		// user can mask link to look like normal text
		FORBID_ATTR: ["style", "class"],
	})
}
