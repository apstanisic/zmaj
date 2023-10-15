import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { useRefresh } from "ra-core"
import { MdRefresh } from "react-icons/md"

export function RefreshButton(): JSX.Element {
	const refresh = useRefresh()

	return (
		<IconButton
			size="large"
			aria-label="Refresh records"
			onPress={() => {
				return refresh()
			}}
		>
			<MdRefresh />
		</IconButton>
	)
}
