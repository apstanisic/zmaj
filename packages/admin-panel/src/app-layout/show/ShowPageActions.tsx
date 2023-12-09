import { useShowLayoutConfig } from "@admin-panel/context/layout-config-context"
import { useIsAllowed } from "@admin-panel/hooks/use-is-allowed"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { RaRecord, useResourceDefinition } from "ra-core"
import { DeleteButton } from "../buttons/DeleteButton"
import { EditButton } from "../buttons/EditButton"
import { ShowChangesButton } from "./ShowChangesButton"
import { ShowRecordAsJsonDialog } from "./ShowRecordAsJsonDialog"

type ShowPageActionsProps = {
	onDelete?: (record: RaRecord) => Promise<unknown>
}

export function ShowPageActions(props: ShowPageActionsProps) {
	const { onDelete } = props
	const resource = useResourceDefinition()
	const config = useShowLayoutConfig()
	const col = useResourceCollection()
	const canDelete = useIsAllowed("delete", col.authzKey)

	return (
		<>
			{resource.hasEdit && <EditButton />}
			{!config.hideDisplayAsJsonButton && <ShowRecordAsJsonDialog />}
			<ShowChangesButton />
			{canDelete && !config.hideDeleteButton && <DeleteButton onSuccess={onDelete} />}
		</>
	)
}
