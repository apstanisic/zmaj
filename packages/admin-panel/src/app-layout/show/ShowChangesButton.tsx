import { useLayoutConfig } from "@admin-panel/context/layout-config-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { getCrudUrl } from "@admin-panel/utils/get-crud-url"
import {
	ActivityLog,
	ActivityLogCollection,
	forbiddenKey,
	getAuthzKey,
	isNil,
} from "@zmaj-js/common"
import { useResourceContext } from "ra-core"
import { useMemo } from "react"
import { MdReplay } from "react-icons/md"
import { useHref } from "react-router"
// import { Link } from "react-router"

/**
 * Do not use, for now
 */
export function ShowChangesButton(): JSX.Element {
	const config = useLayoutConfig()
	const resource = useResourceContext()
	const id = useRecord()?.id

	const link = useHref({
		pathname: getCrudUrl(ActivityLogCollection, "list"),
		search: `filter=${JSON.stringify({
			resource: resource.startsWith("zmaj") ? forbiddenKey : getAuthzKey(resource),
			itemId: id,
		} as Partial<ActivityLog>)}`,
	})

	// show button if action is "show", id is provided, is not activity table,
	// and user didn't disable showing changes
	const showActivityButton = useMemo(
		() => !isNil(id) && !resource.startsWith("zmaj") && config.hideChangesButton !== false,
		[config.hideChangesButton, id, resource],
	)

	if (!showActivityButton) return <></>

	return <ResponsiveButton icon={<MdReplay />} label="Changes" href={link} />
}
