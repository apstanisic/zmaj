import { FileInfo, IdRecord } from "@zmaj-js/common"
import { saveAs as saveFileAs } from "file-saver"
import { useNotify } from "ra-core"
import { trim } from "radash"
import { useCallback } from "react"
import { useSdk } from "../../../context/sdk-context"

/**
 * Hook that provides function that can be used to download files
 *
 * Files are downloaded one by one, so it does not overwhelm the server.
 * Server does not provide option to download many files or to zip them.
 *
 * @param files Files for which download function will be generated
 * @returns Function that will download files to user's device
 */
export function useDownloadFiles(files: IdRecord<FileInfo>[]): () => Promise<void> {
	const sdk = useSdk()
	const notify = useNotify()

	const downloadFiles = useCallback(async () => {
		for (const file of files) {
			if (!file.id) {
				notify("Invalid file ID", { type: "error" })
				continue
			}

			try {
				const result = await sdk.files.download(file)

				// `path.format` allows extension to ends with dot, and won't add dot by
				// itself if extension is without a dot
				// so this is simpler solution, simply trim dots from ends
				const name = trim(`zmaj_file_${file.id}.${file.extension ?? ""}`, ".")

				// Call browser's save file
				saveFileAs(result, name)
			} catch (error) {
				notify("Problem downloading file", { type: "error" })
			}
		}
	}, [files, notify, sdk.files])

	return downloadFiles
}
