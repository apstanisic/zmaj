import { useRecord } from "@admin-panel/hooks/use-record"
import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { Identifier, RaRecord, useCreatePath, useResourceDefinition } from "ra-core"
import { get } from "radash"
import { memo, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MdOutlineVisibility, MdPlaylistRemove, MdUndo } from "react-icons/md"
import { OneToManyReference } from "../OneToManyReference"
import { OneToManyRowsList } from "../shared/OneToManyRowsList"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"
import { OneToManyEditFieldProps } from "./OneToManyEditField"

export function OneToManyEditCurrentItems(
	props: Pick<
		OneToManyEditFieldProps,
		"reference" | "target" | "template" | "source" | "fkNullable"
	>,
): JSX.Element {
	const record = useRecord()
	const { reference, target, template } = props

	const id = record?.id
	if (!id) return <></>

	return (
		<OneToManyReference
			reference={reference}
			filter={{ [target]: id }}
			// we need fk field, not right property: should be comments.postId
			target={target}
			perPage={5}
		>
			<OneToManyRowsList
				className="h-[250px] overflow-auto"
				template={template}
				actions={(record) => (
					<ShowRowActions
						record={record}
						source={props.source}
						canDelete={props.fkNullable !== false}
					/>
				)}
			/>
		</OneToManyReference>
	)
}

const ShowRowActions = memo((props: { record: RaRecord; source: string; canDelete: boolean }) => {
	const { watch, setValue } = useFormContext()
	const changes = watch(props.source)
	const toDelete = get(changes, "removed", [] as Identifier[])
	const isRemoved = useMemo(() => toDelete.includes(props.record.id), [props.record.id, toDelete])
	const { hasShow = false, name } = useResourceDefinition()
	const createPath = useCreatePath()

	return (
		<div className="flex gap-x-2">
			<IconButton
				aria-label="Show record"
				size="small"
				isDisabled={!hasShow}
				onPress={() => {
					const path = createPath({ resource: name, type: "show", id: props.record.id })
					window.open(`#${path}`, "_blank")
				}}
			>
				<MdOutlineVisibility />
			</IconButton>
			<Tooltip
				text={
					!props.canDelete
						? "Value can't be null. You must either delete record, or change its value"
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
})
