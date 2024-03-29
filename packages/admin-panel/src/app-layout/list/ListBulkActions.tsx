import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useListContext, useTranslate } from "ra-core"
import { ReactNode, memo } from "react"
import { MdClose } from "react-icons/md"
import { BulkDeleteButton } from "../buttons/BulkDeleteButton"

type ListBulkActionsProps = {
	render?: (props: { defaultActions: ReactNode }) => ReactNode
}

/**
 * Bulk list actions
 *
 * @todo Since migration to `mui` v4, there is a big change in styling. Fix `classes`.
 */

export const ListBulkActions = memo((props: ListBulkActionsProps) => {
	const list = useListContext()
	const translate = useTranslate()
	return (
		<div className="mb-2 flex w-full justify-between rounded-lg bg-gray-200 py-3 px-3 dark:bg-slate-600">
			<div className="flex items-center">
				<IconButton
					onPress={() => list.onUnselectItems()}
					className="mr-2"
					aria-label="Close"
				>
					<MdClose fontSize="small" />
				</IconButton>
				{translate("ra.action.bulk_actions", {
					_: "ra.action.bulk_actions",
					smart_count: list.selectedIds.length,
				})}
			</div>
			<div className="flex items-center">
				{props.render ? (
					props.render({ defaultActions: <BulkDeleteButton /> })
				) : (
					<BulkDeleteButton />
				)}
			</div>
		</div>
	)
})
