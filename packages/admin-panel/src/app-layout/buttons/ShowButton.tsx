import { useRecord } from "@admin-panel/hooks/use-record"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { useResourceDefinition } from "ra-core"
import { MdVisibility } from "react-icons/md"
import { useHref } from "react-router"

export function ShowButton(props: { onlyIcon?: boolean }): JSX.Element {
	const resource = useResourceDefinition()
	const record = useRecord()
	const href = useHref({ pathname: `/${resource.name}/${record?.id ?? ""}/show` })

	return (
		<ResponsiveButton
			disabled={record?.id === undefined || !resource.hasShow}
			label="Show"
			aria-label={`Show record ${record?.id}`}
			href={href}
			icon={<MdVisibility />}
			display={props.onlyIcon ? "icon" : undefined}
			// onClick={() => redirect("show", resourceInfo.name, record?.id)}
		/>
	)
}
