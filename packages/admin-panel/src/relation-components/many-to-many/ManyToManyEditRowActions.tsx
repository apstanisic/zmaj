import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { ToManyChange } from "@zmaj-js/common"
import { RaRecord, useCreatePath, useRedirect, useResourceDefinition } from "ra-core"
import { memo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { MdOutlineVisibility, MdPlaylistRemove, MdUndo } from "react-icons/md"
import { getEmptyToManyChanges } from "../one-to-many/getEmptyToManyChanges"
import { toManyChangeUtils } from "../one-to-many/shared/toManyChangeUtils"

export const ManyToManyEditRowActions = memo((props: { record: RaRecord; source: string }) => {
	const redirect = useRedirect()
	const { hasEdit = true, hasShow, name: resource } = useResourceDefinition()
	const createPath = useCreatePath()
	const value = useWatch({
		name: props.source,
		defaultValue: getEmptyToManyChanges(),
	}) as ToManyChange
	const { setValue } = useFormContext()

	const deleted = value.removed.includes(props.record.id)

	return (
		<div className="flex gap-x-2">
			{/* Show */}
			{hasShow && (
				<IconButton
					aria-label="show"
					size="small"
					onPress={() =>
						redirect(createPath({ type: "show", id: props.record.id, resource }))
					}
				>
					<MdOutlineVisibility />
				</IconButton>
			)}

			{/* Delete */}
			<Tooltip text={deleted ? "Undo" : "Remove connection"}>
				<IconButton
					aria-label="edit"
					isDisabled={!hasEdit}
					size="small"
					color="warning"
					onPress={() =>
						setValue(
							props.source,
							toManyChangeUtils.toggle(value, "removed", props.record.id),
							{ shouldDirty: true, shouldTouch: true },
						)
					}
				>
					{!deleted ? <MdPlaylistRemove /> : <MdUndo />}
				</IconButton>
			</Tooltip>
		</div>
	)
})
