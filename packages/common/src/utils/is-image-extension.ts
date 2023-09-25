export function isImageExtensionFileName(fileName: string): boolean {
	const ext = fileName.split(".").at(-1) ?? ""
	return [".jpeg", ".jpg", ".png", ".svg", ".gif", ".webp", ".avif"].includes(`.${ext}`)
}
