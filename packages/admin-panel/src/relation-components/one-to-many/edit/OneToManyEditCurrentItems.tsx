import { useRecord } from "@admin-panel/hooks/use-record"
import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { Identifier, RaRecord } from "ra-core"
import { get } from "radash"
import { memo, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MdPlaylistRemove, MdUndo } from "react-icons/md"
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

	return (
		<div className="flex">
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
					// isDisabled={!props.canDelete}
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
