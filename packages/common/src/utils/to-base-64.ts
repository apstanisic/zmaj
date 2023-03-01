export function toBase64(val: string): string {
	return btoa(val)
	// return typeof window === "undefined"
	// 	? Buffer.from(val, "utf8").toString("base64")
	// 	: window.btoa(val)
}
