import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { RaRecord, useCreatePath, useRedirect, useResourceDefinition } from "ra-core"
import { memo } from "react"
import { MdOutlineEdit, MdOutlineVisibility } from "react-icons/md"

export const OneToManyShowRowActions = memo((props: { record: RaRecord }) => {
	const redirect = useRedirect()
	const { hasEdit = true, hasShow, name: resource } = useResourceDefinition()
	const createPath = useCreatePath()

	return (
		<div className="flex">
			{/* Show */}
			{hasShow && (
				<IconButton
					aria-label="show"
					// role="link"
					size="small"
					onPress={() =>
						redirect(createPath({ type: "show", id: props.record.id, resource }))
					}
				>
					<MdOutlineVisibility />
				</IconButton>
			)}

			{/* Edit */}
			<IconButton
				aria-label="edit"
				isDisabled={!hasEdit}
				size="small"
				onPress={() =>
					redirect(createPath({ type: "edit", id: props.record.id, resource }))
				}
			>
				<MdOutlineEdit />
			</IconButton>
		</div>
	)
})
