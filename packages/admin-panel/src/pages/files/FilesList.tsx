import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { GeneratedListPage } from "../../generator/pages/GeneratedListPage"
import { BulkFileDownloadButton } from "./components/BulkFileDownloadButton"
import { FileActionsToolbar } from "./components/FileActionsToolbar"
import { FileUploadDialog } from "./components/FileUploadDialog"
// import { FoldersSidebar } from "./components/FoldersSidebar"

export function FilesList() {
	useHtmlTitle("Files")
	return (
		<>
			<FileUploadDialog />
			<GeneratedListPage
				renderActions={({ defaultActions }) => (
					<>
						<FileActionsToolbar /> {defaultActions}{" "}
					</>
				)}
				renderBulkActions={({ defaultActions }) => (
					<>
						{defaultActions}
						<BulkFileDownloadButton />
					</>
				)}
			/>
		</>
	)
}
