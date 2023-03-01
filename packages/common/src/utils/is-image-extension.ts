import { ImageExtension } from "@common/modules/files/image-extension.type"

export function isImageExtension(extension?: string | null): extension is ImageExtension {
	return ["jpeg", "jpg", "png", "svg", "gif", "webp", "avif"].includes(extension ?? "")
}
