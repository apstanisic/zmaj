import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useRefresh } from "ra-core"
import { MdRefresh } from "react-icons/md"

/**
 * Located in App bar
 */
export function RefreshButton() {
	const refresh = useRefresh()

	return (
		<IconButton
			size="large"
			className={"text-white"}
			aria-label="Refresh records"
			onPress={refresh}
		>
			<MdRefresh />
		</IconButton>
	)
}
