import { useRecord } from "@admin-panel/hooks/use-record"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { useResourceDefinition } from "ra-core"
import { MdEdit } from "react-icons/md"
import { useHref } from "react-router"

export function EditButton(props: { onlyIcon?: boolean }): JSX.Element {
	const resource = useResourceDefinition()
	const record = useRecord()
	const href = useHref({ pathname: `/${resource.name}/${record?.id ?? ""}` })

	return (
		<ResponsiveButton
			small
			disabled={record?.id === undefined || !resource.hasEdit}
			label="Edit"
			aria-label={"Edit record " + record?.id}
			href={href}
			icon={<MdEdit />}
			display={props.onlyIcon ? "icon" : undefined}
			// onClick={() => redirect("Edit", resourceInfo.name, record.id)}
		/>
	)
}
