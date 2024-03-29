import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useRefresh } from "ra-core"
import { MdRefresh } from "react-icons/md"

/**
 * Located in App bar
 */
export function RefreshButton(): JSX.Element {
	const refresh = useRefresh()

	return (
		<IconButton size="large" aria-label="Refresh records" onPress={refresh}>
			<MdRefresh />
		</IconButton>
	)
}
