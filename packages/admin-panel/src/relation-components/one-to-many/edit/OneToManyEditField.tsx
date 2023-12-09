import { TabHeaderItems, TabsSection } from "@admin-panel/crud-layouts/ui/tabs/TabHeaderV2"
import {
	ShowFieldContainer,
	ShowFieldContainerTitle,
} from "@admin-panel/shared/show/ShowFieldContainer"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { cn } from "@admin-panel/utils/cn"
import { ToManyChange } from "@zmaj-js/common"
import { ReactNode, useMemo, useState } from "react"
import { Tabs } from "react-aria-components"
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
	/**
	 * By default we will display our `currentItems`, but user can provide custom data.
	 * This way we can reuse this component in many-to-many.
	 */
	currentItems?: ReactNode
}

export function OneToManyEditField(props: OneToManyEditFieldProps) {
	const { fkNullable = false } = props
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
			<Tabs className={cn("w-full overflow-hidden", props.className)}>
				<ShowFieldContainer
					label={props.label}
					// className={cn(props.className, "h-[460px]")}
					header={
						<div className="flex justify-between items-center">
							<ShowFieldContainerTitle label={props.label} />

							<TabHeaderItems
								items={[
									{ id: "current", text: "Current" },
									{
										id: "added",
										text: <span>To be added ({value.added.length})</span>,
									},
									fkNullable
										? {
												id: "deleted",
												text: (
													<span>
														To be deleted ({value.removed.length})
													</span>
												),
										  }
										: null,
								]}
							/>
							<div className="flex gap-x-2 ">
								<AddItemButton
									disabled={props.disabled}
									onPress={() => setOpen(true)}
								/>
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
						</div>
					}
				>
					<TabsSection id="current" className="w-full flex flex-col h-[330px]">
						{props.currentItems ?? (
							<OneToManyEditCurrentItems
								source={props.source}
								reference={props.reference}
								target={props.target}
								template={props.template}
								fkNullable={fkNullable}
							/>
						)}
					</TabsSection>
					<TabsSection className="w-full flex flex-col h-[330px]" id="added">
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
					{fkNullable && (
						<TabsSection className="w-full flex flex-col h-[330px]" id="deleted">
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
					)}
					{/* </TabsLayout> */}
				</ShowFieldContainer>
			</Tabs>
		</>
	)
}

function ResetChanges(props: { disabled?: boolean; reset: () => unknown; value: ToManyChange }) {
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
				}}
			>
				<MdRestartAlt />
			</IconButton>
		</Tooltip>
	)
}

function AddItemButton(props: { disabled?: boolean; onPress: () => unknown }) {
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
