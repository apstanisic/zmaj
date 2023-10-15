import { ResponsiveButton, ResponsiveButtonProps } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useResourceContext } from "ra-core"
import { MdAdd } from "react-icons/md"
import { useHref } from "react-router"

type CreateButtonProps = Partial<ResponsiveButtonProps> & {
	query?: string
	resource?: string
}

export function CreateButton(props: CreateButtonProps): JSX.Element {
	const resource = useResourceContext()
	const href = useHref({
		pathname: `/${props.resource ?? resource}/create`,
		search: props.query && !props.query.startsWith("?") ? `?${props.query}` : props.query,
	})

	return (
		<ResponsiveButton
			size="small"
			label="Create"
			aria-label="Create record"
			href={href}
			icon={<MdAdd />}
			{...props}
			// onClick={() => redirect("show", resourceInfo.name, record.id)}
		/>
	)
}
