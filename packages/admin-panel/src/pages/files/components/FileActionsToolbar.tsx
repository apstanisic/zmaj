import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { systemPermissions } from "@zmaj-js/common"
import { MdCloudUpload } from "react-icons/md"
import { useIsAllowedSystem } from "../../../hooks/use-is-allowed"
import { useShowUploadDialog } from "../hooks/use-show-upload-dialog"

const { actions, resource } = systemPermissions.files

export function FileActionsToolbar() {
	const [, setShowDialog] = useShowUploadDialog()
	// const [showFolders, setShowFolders] = useShowFoldersSidebar()

	const canUpload = useIsAllowedSystem("files", "create")

	return (
		<>
			{canUpload && (
				<ResponsiveButton
					icon={<MdCloudUpload />}
					onPress={() => setShowDialog(true)}
					label="Upload"
				/>
			)}

			{/* <Button
        onClick={() => setShowFolders(!showFolders)}
        label={showFolders ? "Hide Folders" : "Show Folders"}
      >
        <AccountTreeOutlined />
      </Button> */}
		</>
	)
}
