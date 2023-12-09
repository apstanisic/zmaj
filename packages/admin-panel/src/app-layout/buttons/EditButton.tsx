import { useRecord } from "@admin-panel/hooks/use-record"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useResourceDefinition } from "ra-core"
import { MdEdit } from "react-icons/md"
import { useHref } from "react-router"

export function EditButton(props: { onlyIcon?: boolean }) {
	const resource = useResourceDefinition()
	const record = useRecord()
	const href = useHref({ pathname: `/${resource.name}/${record?.id ?? ""}` })

	const disabled = record?.id === undefined || !resource.hasShow

	if (props.onlyIcon) {
		return (
			<IconButton aria-label={`Edit record ${record?.id}`} href={href} isDisabled={disabled}>
				<MdEdit />
			</IconButton>
		)
	}

	return (
		<ResponsiveButton
			icon={<MdEdit />}
			label="Edit"
			aria-label={`Edit record ${record?.id}`}
			href={href}
			isDisabled={disabled}
		/>
	)
}
