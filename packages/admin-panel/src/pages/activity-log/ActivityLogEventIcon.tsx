import { useRecord } from "@admin-panel/hooks/use-record"
import { ActivityLog } from "@zmaj-js/common"
import { memo } from "react"
import { MdAddCircle, MdDelete, MdDns, MdEdit } from "react-icons/md"

/**
 *
 *
 * @param props.action Action that happened. If it's CRUD event, we provide special icons since
 * it's most common event
 * @returns Icon to display
 */
export const ActivityLogEventIcon = memo((props: { action?: string }) => {
	const record = useRecord<ActivityLog>()
	const action = props.action ?? record?.action ?? ""

	return (
		<div className="flex items-center justify-start">
			<span>
				{action === "create" && <MdAddCircle className="text-success opacity-70" />}
				{action === "delete" && <MdDelete className="text-error opacity-70" />}
				{action === "update" && <MdEdit className="text-warning opacity-70" />}
				{!["create", "update", "delete"].includes(action) && (
					// DNS Icon is used for non crud actions
					<MdDns className="text-info opacity-70" />
				)}
			</span>
			<span className="ml-2">{action}</span>
		</div>
	)
})
