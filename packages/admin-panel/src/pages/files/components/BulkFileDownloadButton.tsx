import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { FileInfo, systemPermissions } from "@zmaj-js/common"
import { useListContext, useNotify } from "ra-core"
import { useCallback } from "react"
import { MdGetApp } from "react-icons/md"
import { useIsAllowed } from "../../../hooks/use-is-allowed"
import { useDownloadFiles } from "../hooks/use-download-files"

const { actions, resource } = systemPermissions.files

/**
 * Renders file download button that will download all selected files from react admin list context
 */
export function BulkFileDownloadButton() {
	const { data, selectedIds, onSelect } = useListContext<FileInfo>()
	const notify = useNotify()

	// We only need id to download file, so if we only have ID, we can still download
	const downloadAction = useDownloadFiles(
		selectedIds.map((id) => data?.find((r) => r.id === id) ?? { id }),
	)

	const download = useCallback(async () => {
		await downloadAction()
		onSelect([])
		notify("Files downloaded successfully", { type: "success" })
	}, [downloadAction, notify, onSelect])

	// check if user can download file
	const allowed = useIsAllowed(actions.read.key, resource)
	if (!allowed) return <></>

	return <ResponsiveButton onPress={download} label="Download" icon={<MdGetApp />} />
}
