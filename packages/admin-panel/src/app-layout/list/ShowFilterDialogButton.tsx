import { useListLayoutConfig } from "@admin-panel/context/layout-config-context"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { memo } from "react"
import { MdFilterList } from "react-icons/md"
import { useShowFilterDialog } from "./use-show-filter-dialog"

/**
 * Button that displays filter dialog
 */
export const ShowFilterDialogButton = memo(() => {
	const config = useListLayoutConfig()

	const [, setShowDialog] = useShowFilterDialog()

	const disabledFilter = config.disableFilter ?? false

	if (disabledFilter) return <></>

	return (
		<ResponsiveButton
			onPress={() => setShowDialog(true)}
			label="Add filter" //
			icon={<MdFilterList />}
		/>
	)
})
