import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { memo } from "react"
import { MdFilterList } from "react-icons/md"
import { useShowFilterDialog } from "./use-show-filter-dialog"

/**
 * Button that displays filter dialog
 */
export const ShowFilterDialogButton = memo(() => {
	const config = useLayoutConfigContext().list

	const [, setShowDialog] = useShowFilterDialog()

	const disabledFilter = config.disableFilter ?? false

	if (disabledFilter) return <></>

	return (
		<ResponsiveButton
			onClick={() => setShowDialog(true)}
			label="Add filter" //
			icon={<MdFilterList />}
		/>
	)
})
