export function fromBase64(b64String: string): string {
	return atob(b64String)
	// return typeof window === "undefined"
	// 	? Buffer.from(b64String, "base64").toString("utf8")
	// 	: window.atob(b64String)
}
