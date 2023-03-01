import { FileInfo, IdRecord, percent } from "@zmaj-js/common"
import { useNotify } from "ra-core"
import { useCallback } from "react"
import { useList as useListState } from "react-use"
import { useSdk } from "../../../context/sdk-context"
import { useSelectedStorage } from "./use-selected-storage"

/**
 * Props for useFileUpload hook
 */
export type UseUploadFileProps = {
	/**
	 * After every successful upload, call this function
	 */
	onUpload?: (file: IdRecord<FileInfo>) => void | Promise<void>
	/**
	 * After all uploads call this function
	 */
	afterUpload?: (uploadedFiles: IdRecord<FileInfo>[]) => void | Promise<void>
}

/**
 * Return data from hooks
 */
type UseUploadFilesResult = {
	/**
	 * Current progress
	 *
	 * Every item in this array is current upload progress. If array is empty, there is no upload.
	 * Progress is from 0-100, except in the case of the error, then is -1
	 */
	progress: number[]
	/**
	 * Function that will upload file
	 *
	 * First param is all files that you want to upload, second is options object that contains
	 * abort signal to cancel upload
	 *
	 */
	upload: (files: File[], options?: { signal?: AbortSignal }) => Promise<void>
}

/**
 *
 * Hook to upload files
 *
 * This is mostly used to provide progress bar and notifications, and most of uploading
 * is happening in SDK.
 *
 * @param params Params required for this hook
 * @returns Object that provides function to upload files
 */
export function useUploadFiles(params?: UseUploadFileProps): UseUploadFilesResult {
	const { afterUpload, onUpload } = params ?? {}

	/**
	 * Upload progress. Every number in list is file that is being uploaded.
	 * If array is empty, there are no active uploads.
	 */
	const notify = useNotify()
	const sdk = useSdk()
	const [progress, changeUploadProgress] = useListState<number>([])
	const [selectedStorage] = useSelectedStorage()

	/**
	 * On files drop
	 */
	const upload = useCallback<UseUploadFilesResult["upload"]>(
		async (files, options) => {
			// if (uploadProgress.length !== 0) return notify('Some files are already uploading', 'error')
			changeUploadProgress.set(files.map(() => 0))

			// Current upload index
			let i = 0

			const uploadIterator = sdk.files.uploadMany({
				files,
				provider: selectedStorage,
				signal: options?.signal,
				onProgress: (progress) =>
					changeUploadProgress.updateAt(i, percent(progress.loaded, progress.total)),
			})

			const uploadedFiles: IdRecord<FileInfo>[] = []

			let uploadSuccess = 0
			let uploadFail = 0

			for await (const [file, err] of uploadIterator) {
				if (err) {
					uploadFail++
					changeUploadProgress.updateAt(i, -1)
				} else {
					uploadSuccess++
					await onUpload?.(file)
					uploadedFiles.push(file)
				}
				i++
			}

			if (uploadFail === 0) {
				notify("Upload successful", { type: "success" })
			} else if (uploadSuccess === 0) {
				notify("Upload failed", { type: "error" })
			} else {
				notify(`${uploadSuccess} success, ${uploadFail} fail`, { type: "warning" })
			}

			// remove all progress when upload is done
			changeUploadProgress.clear()
			// call fn after all is done
			await afterUpload?.(uploadedFiles)
		},
		[afterUpload, changeUploadProgress, notify, onUpload, sdk.files, selectedStorage],
	)

	return { progress, upload }
}
