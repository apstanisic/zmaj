import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { BulkFileDownloadButton } from "./components/BulkFileDownloadButton"
import { FileActionsToolbar } from "./components/FileActionsToolbar"
import { FileUploadDialog } from "./components/FileUploadDialog"
// import { FoldersSidebar } from "./components/FoldersSidebar"

export function FilesList(): JSX.Element {
	return (
		<>
			<FileUploadDialog />
			<GeneratedListPage
				actionsStart={<FileActionsToolbar />}
				bulkActionsStart={<BulkFileDownloadButton />}
				// sidebar={<FoldersSidebar />}
			/>
		</>
	)
}
