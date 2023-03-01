import { IconButton } from "@admin-panel/ui/IconButton"
import { useListContext, useTranslate } from "ra-core"
import { memo, ReactNode } from "react"
import { MdClose } from "react-icons/md"
import { BulkDeleteButton } from "../buttons/BulkDeleteButton"

type ListBulkActionsProps = {
	startButtons?: ReactNode
	endButtons?: ReactNode
	hideDefaultActions?: boolean
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
				<IconButton onClick={() => list.onUnselectItems()} className="mr-2" label="Close">
					<MdClose fontSize="small" />
				</IconButton>
				{translate("ra.action.bulk_actions", {
					_: "ra.action.bulk_actions",
					smart_count: list.selectedIds.length,
				})}
			</div>
			<div className="flex items-center">
				{props.startButtons}
				{props.hideDefaultActions !== true && <BulkDeleteButton />}
				{props.endButtons}
			</div>
		</div>
	)
})
