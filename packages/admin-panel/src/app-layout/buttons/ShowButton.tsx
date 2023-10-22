import { useRecord } from "@admin-panel/hooks/use-record"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { useResourceDefinition } from "ra-core"
import { MdVisibility } from "react-icons/md"
import { useHref } from "react-router"

export function ShowButton(props: { onlyIcon?: boolean }): JSX.Element {
	const resource = useResourceDefinition()
	const record = useRecord()
	const href = useHref({ pathname: `/${resource.name}/${record?.id ?? ""}/show` })

	const disabled = record?.id === undefined || !resource.hasShow

	if (props.onlyIcon) {
		return (
			<IconButton aria-label={`Show record ${record?.id}`} href={href} isDisabled={disabled}>
				<MdVisibility />
			</IconButton>
		)
	}

	return (
		<ResponsiveButton
			icon={<MdVisibility />}
			label="See detailed"
			aria-label={`Show record ${record?.id}`}
			href={href}
			isDisabled={disabled}
		/>
	)
}
