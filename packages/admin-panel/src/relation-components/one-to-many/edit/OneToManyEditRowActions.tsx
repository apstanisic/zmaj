import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { Identifier, RaRecord, useCreatePath, useResourceDefinition } from "ra-core"
import { get } from "radash"
import { memo, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MdOutlineVisibility, MdPlaylistRemove, MdUndo } from "react-icons/md"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"

export const OneToManyEditRowActions = memo(
	(props: { record: RaRecord; source: string; canDelete: boolean }) => {
		const { watch, setValue } = useFormContext()
		const changes = watch(props.source)
		const toDelete = get(changes, "removed", [] as Identifier[])
		const isRemoved = useMemo(
			() => toDelete.includes(props.record.id),
			[props.record.id, toDelete],
		)
		const { hasShow = false, name } = useResourceDefinition()
		const createPath = useCreatePath()

		return (
			<div className="flex gap-x-2">
				<IconButton
					aria-label="Show record"
					size="small"
					isDisabled={!hasShow}
					onPress={() => {
						const path = createPath({
							resource: name,
							type: "show",
							id: props.record.id,
						})
						window.open(`#${path}`, "_blank")
					}}
				>
					<MdOutlineVisibility />
				</IconButton>
				<Tooltip
					text={
						!props.canDelete
							? "Referenced record must point to some source record"
							: isRemoved
							? "Remove mark for records disconnect"
							: "Mark for records disconnect"
					}
					side="left"
				>
					<IconToggleButton
						aria-label="Remove item from current record"
						color="warning"
						isOn={toDelete.includes(props.record.id)}
						on={<MdUndo />}
						off={<MdPlaylistRemove />}
						isDisabled={!props.canDelete}
						size="small"
						onPress={() => {
							setValue(
								props.source,
								toManyChangeUtils.toggle(changes, "removed", props.record.id),
							)
						}}
					/>
				</Tooltip>
			</div>
		)
	},
)
