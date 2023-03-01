import { Confirm } from "@admin-panel/ui/Confirm"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { RaRecord, useDeleteMany, useListContext, useNotify } from "ra-core"
import { isString } from "radash"
import { useState } from "react"
import { MdViewList } from "react-icons/md"

export function BulkDeleteButton(props: {
	onSuccess?: (record: RaRecord[]) => void | Promise<unknown>
	label?: string
}): JSX.Element {
	const notify = useNotify()
	const [showConfirm, setShowConfirm] = useState(false)
	const { selectedIds, onUnselectItems, resource } = useListContext()
	const [raDelete] = useDeleteMany(
		resource,
		{ ids: selectedIds },
		{
			onSuccess: (data) => {
				if (props.onSuccess) {
					return props.onSuccess(data)
				}

				notify("ra.notification.deleted", {
					type: "success",
					messageArgs: { smart_count: selectedIds.length },
				})
				onUnselectItems()
			},
			onError(error: Error | string) {
				setShowConfirm(false)
				notify(
					isString(error) ? error : error.message || "ra.notification.http_error", //
					{ type: "warning" },
				)
			},
		},
	)

	return (
		<>
			<ResponsiveButton
				outline
				label={props.label ?? "Delete"}
				aria-label="Delete selected records"
				disabled={selectedIds.length === 0}
				variant="error"
				className="border-transparent"
				onClick={() => setShowConfirm(true)}
				icon={<MdViewList />}
			/>
			<Confirm
				onClose={() => setShowConfirm(false)}
				open={showConfirm}
				onConfirm={raDelete}
				title="Are you sure?"
				content="This action can not be reversed"
			/>
		</>
	)
}
