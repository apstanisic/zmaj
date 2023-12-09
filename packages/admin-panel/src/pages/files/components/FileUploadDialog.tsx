import { Dialog } from "@admin-panel/ui/Dialog"
import { useNotify, useRefresh } from "ra-core"
import { useShowUploadDialog } from "../hooks/use-show-upload-dialog"
import { FileUploadDropzone } from "./FileUploadDropzone"

export function FileUploadDialog() {
	const refresh = useRefresh()
	const notify = useNotify()
	const [showDialog, setShowDialog] = useShowUploadDialog()

	return (
		<div>
			<Dialog
				open={showDialog}
				onClose={() => setShowDialog(!showDialog)}
				className="max-w-2xl"
			>
				<FileUploadDropzone
					afterUpload={() => {
						// notify("Upload successful", { type: "success" })
						refresh()
						setShowDialog(false)
					}}
				/>
			</Dialog>
		</div>
	)
}
