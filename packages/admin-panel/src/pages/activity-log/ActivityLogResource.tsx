import { ActivityLogCollection, forbiddenAction, systemPermissions } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { ActivityLogList } from "./ActivityLogList"
import { ActivityLogShow } from "./ActivityLogShow"

export function activityLogResource(): JSX.Element {
	return (
		<Resource
			name={ActivityLogCollection.collectionName}
			list={ActivityLogList}
			show={ActivityLogShow}
			options={{
				label: ActivityLogCollection.label ?? "Activity Log",
				authzResource: systemPermissions.activityLog.resource, //
				authzActions: {
					create: forbiddenAction,
					edit: forbiddenAction,
				},
			}}
		/>
	)
}
