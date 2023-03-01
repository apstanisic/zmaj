import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { useResourceContext } from "ra-core"
import { MdViewList } from "react-icons/md"
import { useHref } from "react-router"

export function ListButton(): JSX.Element {
	const resource = useResourceContext()
	const href = useHref({ pathname: `/${resource}/` })

	return (
		<ResponsiveButton
			small
			label="Show All"
			aria-label="Show all records"
			href={href} //
			icon={<MdViewList />}
		/>
	)
}
