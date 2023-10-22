import { useRecord } from "@admin-panel/hooks/use-record"
import { Confirm } from "@admin-panel/ui/Confirm"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import {
	RaRecord,
	useDelete,
	useNotify,
	useRedirect,
	useResourceContext,
	useUnselect,
} from "ra-core"
import { isString } from "radash"
import { useState } from "react"
import { MdDelete } from "react-icons/md"

export function DeleteButton(props: {
	onSuccess?: (record: RaRecord) => Promise<unknown>
	label?: string
	disabled?: boolean
	onlyIcon?: boolean
	"aria-label"?: string
}): JSX.Element {
	const resource = useResourceContext()
	const record = useRecord()
	const unselect = useUnselect(resource)
	const notify = useNotify()
	const redirect = useRedirect()
	const [showConfirm, setShowConfirm] = useState(false)
	const [raDelete] = useDelete(
		resource,
		{ id: record?.id, previousData: record },
		{
			onSuccess: (data) => {
				if (props.onSuccess) {
					return props.onSuccess(data)
				}

				notify("ra.notification.deleted", {
					type: "success",
					messageArgs: { smart_count: 1 },
				})
				if (record) unselect([record.id])
				redirect("list", resource)
				return
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
			{props.onlyIcon ? (
				<IconButton
					aria-label={`Delete record ${record?.id}`}
					isDisabled={record?.id === undefined || props.disabled}
					onPress={() => setShowConfirm(true)}
					color="error"
				>
					<MdDelete />
				</IconButton>
			) : (
				<ResponsiveButton
					icon={<MdDelete />}
					label={props.label ?? "Delete"}
					color="error"
					variant="text"
					aria-label={`Delete record ${record?.id}`}
					onPress={() => setShowConfirm(true)}
					isDisabled={record?.id === undefined || props.disabled}
				/>
			)}
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
