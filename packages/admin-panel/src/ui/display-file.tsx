import { ZmajSdk } from "@zmaj-js/client-sdk"
import { FileInfo, isImageExtensionFileName, joinUrl, qsStringify } from "@zmaj-js/common"
import { clsx } from "clsx"
import { useSdk } from "../context/sdk-context"
import { ImagePlaceholder } from "./ImagePlaceholder"

type Props = {
	file: Partial<FileInfo>
	size?: string
	className?: string
}

export function DisplayZmajFile({ file, size, className }: Props): JSX.Element {
	const sdk = useSdk()

	const canShow =
		(file.mimeType?.startsWith("image") && isImageExtensionFileName(file.name ?? "")) ?? false

	if (!canShow || file.id === undefined) {
		return (
			<div className={clsx(className, "center")}>
				<ImagePlaceholder />
			</div>
		)
	}

	const imgUrl = getImageUrl(sdk, file.id, size)
	return <img className={clsx(className)} src={imgUrl} alt={file.description ?? ""} />
}

export function getImageUrl(sdk: ZmajSdk, fileId: string, size?: string): string {
	const query = qsStringify({ accessToken: sdk.auth.accessToken, size })

	return joinUrl(sdk.apiUrl, `/files/${fileId}/content?${query}`)
}
