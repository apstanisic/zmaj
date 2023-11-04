import { TabsLayout } from "@admin-panel/crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "@admin-panel/crud-layouts/ui/tabs/TabsSection"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { cn } from "@admin-panel/utils/cn"
import { ToManyChange } from "@zmaj-js/common"
import { ReactNode, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { MdAdd, MdRestartAlt } from "react-icons/md"
import { getEmptyToManyChanges } from "../getEmptyToManyChanges"
import { OneToManyAddedItems } from "../shared/OneToManyChangedItems"
import { toManyChangeUtils } from "../shared/toManyChangeUtils"
import { OneToManyEditAddPicker } from "./OneToManyEditAddPicker"
import { OneToManyEditCurrentItems } from "./OneToManyEditCurrentItems"

export type OneToManyEditFieldProps = {
	source: string
	target: string
	reference: string
	label: string
	className?: string
	template?: string
	fkNullable?: boolean
	disabled?: boolean
	currentItems?: ReactNode
}

export function OneToManyEditField(props: OneToManyEditFieldProps): JSX.Element {
	const { setValue, resetField } = useFormContext()
	const [open, setOpen] = useState(false)
	const value = useWatch({
		name: props.source,
		defaultValue: getEmptyToManyChanges(),
	}) as ToManyChange
	return (
		<>
			<OneToManyEditAddPicker
				open={open}
				setOpen={setOpen}
				reference={props.reference} //
				source={props.source}
				target={props.target}
				disabled={props.disabled}
				template={props.template}
			/>
			<ShowFieldContainer
				label={props.label}
				className={cn(props.className, "h-[460px]")}
				actions={
					<div className="flex ml-auto gap-x-2">
						<AddItemButton disabled={props.disabled} onPress={() => setOpen(true)} />
						<ResetChanges
							disabled={props.disabled}
							value={value}
							reset={() =>
								resetField(props.source, {
									keepDirty: false,
									defaultValue: getEmptyToManyChanges(),
								})
							}
						/>
					</div>
				}
			>
				<TabsLayout
					size="small"
					sections={[
						<p key={0} className="text-info">
							Current
						</p>,
						<p key={1} className="text-success">
							To be added
							<span className="du-badge du-badge-sm du-badge-success ml-2">
								{value.added.length}
							</span>
						</p>,
						<p key={2} className="text-error-content">
							To be deleted
							<span className="du-badge du-badge-sm du-badge-warning ml-2">
								{value.removed.length}
							</span>
						</p>,
					]}
				>
					<div className="mt-3">
						<TabsSection>
							{props.currentItems ?? (
								<OneToManyEditCurrentItems
									source={props.source}
									reference={props.reference}
									target={props.target}
									template={props.template}
									fkNullable={props.fkNullable}
								/>
							)}
						</TabsSection>
						<TabsSection className="w-full flex flex-col">
							<OneToManyAddedItems
								added={value.added}
								reference={props.reference}
								template={props.template}
								onRevert={function (id) {
									const newVal = toManyChangeUtils.remove(value, "added", id)
									setValue(props.source, newVal, {
										shouldDirty: true,
										shouldTouch: true,
									})
								}}
							/>
						</TabsSection>
						<TabsSection className="w-full flex flex-col">
							<OneToManyAddedItems
								added={value.removed}
								reference={props.reference}
								template={props.template}
								onRevert={function (id) {
									const newVal = toManyChangeUtils.remove(value, "removed", id)
									setValue(props.source, newVal, {
										shouldDirty: true,
										shouldTouch: true,
									})
								}}
							/>
						</TabsSection>
					</div>
				</TabsLayout>
			</ShowFieldContainer>
		</>
	)
}

function ResetChanges(props: {
	disabled?: boolean
	reset: () => unknown
	value: ToManyChange
}): JSX.Element {
	const noChanges = useMemo(
		() => props.value.added.length === 0 && props.value.removed.length === 0,
		[props.value.added, props.value.removed],
	)
	return (
		<Tooltip text={noChanges ? "There are no changes" : "Revert changes"}>
			<IconButton
				size="small"
				aria-label="Reset changes"
				isDisabled={props.disabled || noChanges}
				className="mb-1"
				variant="text"
				onPress={() => {
					const sure = confirm("Are you sure?")
					if (!sure) return
					props.reset()
					// changes.setValue({ type: "toMany", added: [], removed: [] })
				}}
			>
				<MdRestartAlt />
			</IconButton>
		</Tooltip>
	)
}

function AddItemButton(props: { disabled?: boolean; onPress: () => unknown }): JSX.Element {
	return (
		<Tooltip text="Add">
			<IconButton
				size="small"
				aria-label={`Add records`}
				className="ml-auto"
				isDisabled={props.disabled}
				onPress={props.onPress}
			>
				<MdAdd />
			</IconButton>
		</Tooltip>
	)
}
