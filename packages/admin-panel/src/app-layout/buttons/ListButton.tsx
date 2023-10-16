import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useRedirect, useResourceContext } from "ra-core"
import { MdViewList } from "react-icons/md"

export function ListButton(): JSX.Element {
	const resource = useResourceContext()
	const redirect = useRedirect()

	return (
		<ResponsiveButton
			size="small"
			label="Show All"
			aria-label="Show all records"
			onPress={() => redirect("list", resource)}
			icon={<MdViewList />}
		/>
	)
}
