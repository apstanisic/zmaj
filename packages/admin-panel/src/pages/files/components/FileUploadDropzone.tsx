import { Button } from "@admin-panel/ui/Button"
import { useRef } from "react"
import { useDropzone } from "react-dropzone"
import { MdCloudUpload } from "react-icons/md"
import { UseUploadFileProps, useUploadFiles } from "../hooks/use-upload-files"
import { FileUploadProgressBars } from "./FileUploadProgressBars"
import { StorageProvidersDropdown } from "./StorageProvidersDropdown"

/**
 * Should there be upload with url, since most of the websites are blocking CORS request?
 * And user will
 */
export function FileUploadDropzone(
	props: UseUploadFileProps & { className?: string; maxFiles?: number },
): JSX.Element {
	const abort = useRef(new AbortController())
	const { upload, progress } = useUploadFiles(props)
	const { getRootProps, getInputProps } = useDropzone({
		// we must ignore promise
		onDrop: async (files) => upload(files, { signal: abort.current.signal }),
		maxSize: 50_000_000, // around 50mb
		maxFiles: props.maxFiles,
		multiple: true,
		// fsAccessApi is not stable and is not supported in testing by playwright
		useFsAccessApi: false,
	})

	return (
		<div className="p-6">
			<div className="flex justify-between pb-4">
				<StorageProvidersDropdown />
				{progress.length > 0 && (
					<Button
						variant="warning"
						onClick={() => {
							abort.current.abort()
							abort.current = new AbortController()
						}}
					>
						Cancel Upload
					</Button>
				)}
			</div>

			<div className="relative mx-auto w-[450px] max-w-full md:w-[600px]">
				{/* This has absolute position that overrides dropzone */}
				<FileUploadProgressBars progress={progress} />

				{/* ---------- Dropzone ------------- */}
				<div
					{...getRootProps()}
					className="center z-10 min-h-[250px] min-w-[200px] cursor-pointer flex-col overflow-hidden rounded border border-gray-300 "
				>
					<input {...(getInputProps() as any)} />
					<div className="p-3 text-xl">Drop some files here, or click to select files</div>
					<MdCloudUpload className="text-6xl text-gray-800 dark:text-gray-200" />
				</div>
				{/* ---------------- End Dropzone ---------- */}
			</div>
		</div>
	)
}
