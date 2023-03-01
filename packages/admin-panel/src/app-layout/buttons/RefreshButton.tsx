import { IconButton } from "@admin-panel/ui/IconButton"
import { useRefresh } from "ra-core"
import { MdRefresh } from "react-icons/md"

export function RefreshButton(): JSX.Element {
	const refresh = useRefresh()

	return (
		<IconButton large label="Refresh records" onClick={() => refresh()}>
			<MdRefresh />
		</IconButton>
	)
}
