import { TabsLayout } from "@admin-panel/crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "@admin-panel/crud-layouts/ui/tabs/TabsSection"
import { useRecord } from "@admin-panel/hooks/use-record"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { Button } from "@admin-panel/ui/buttons/Button"
import { Identifier, RaRecord } from "ra-core"
import { get } from "radash"
import { memo, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { MdPlaylistRemove, MdUndo } from "react-icons/md"
import { OneToManyReference } from "../OneToManyReference"
import { OneToManyRowsList } from "../shared/OneToManyRowsList"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"

export type OneToManyEditFieldProps = {
	source: string
	target: string
	reference: string
	label: string
	className?: string
	template?: string
	fkNullable?: boolean
}

export function OneToManyEditField(props: OneToManyEditFieldProps): JSX.Element {
	return (
		<ShowFieldContainer
			header={
				<div className="flex-grow flex justify-between items-center">
					<p>Hello</p>

					<div className=" mb-2 mt-1 flex gap-x-1">
						<Button size="small" color="transparent" className="!text-info font-normal">
							Current items
						</Button>
						<Button
							size="small"
							color="transparent"
							className="!text-success font-normal"
						>
							To be added
						</Button>
						<Button
							size="small"
							color="transparent"
							className="!text-warning-content font-normal"
						>
							To be deleted
						</Button>
					</div>

					<p>Add</p>
				</div>
			}
			className={props.className}
		>
			<TabsLayout
				size="small"
				sections={[
					<p key={0} className="text-info">
						Current
					</p>,
					<p key={1} className="text-success">
						To add
					</p>,
					<p key={2} className="text-warning-content">
						To delete
					</p>,
				]}
			>
				<TabsSection>
					<CurrentItems
						source={props.source}
						reference={props.reference}
						target={props.target}
						template={props.template}
						fkNullable={props.fkNullable}
					/>
				</TabsSection>
				<TabsSection>
					<AddedItems
						source={props.source}
						reference={props.reference}
						target={props.target}
						template={props.template}
						fkNullable={props.fkNullable}
					/>
				</TabsSection>
				<TabsSection>3</TabsSection>
			</TabsLayout>
		</ShowFieldContainer>
	)
}

export function CurrentItems(
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

export function AddedItems(
	props: Pick<
		OneToManyEditFieldProps,
		"reference" | "target" | "template" | "source" | "fkNullable"
	>,
): JSX.Element {
	return <div>hello</div>
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
