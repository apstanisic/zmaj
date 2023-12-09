import { ActivityLogCollection } from "@zmaj-js/common"
import { Resource } from "ra-core"
import { ActivityLogList } from "./ActivityLogList"
import { ActivityLogShow } from "./ActivityLogShow"

export function activityLogResource() {
	return (
		<Resource
			name={ActivityLogCollection.collectionName}
			list={ActivityLogList}
			show={ActivityLogShow}
			options={{ collection: ActivityLogCollection }}
		/>
	)
}
