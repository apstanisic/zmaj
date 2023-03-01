import { useRelationContext } from "@admin-panel/context/relation-context"
import { clsx } from "clsx"
import { ResourceContextProvider, useListContext } from "ra-core"
import { memo } from "react"
import { useToManyInputContext } from "../../../../context/to-many-input-context"
import { fullWidthFieldCss } from "../../../../crud-layouts/get-field-width-css"
import { TabsLayout } from "../../../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../../../crud-layouts/ui/tabs/TabsSection"
import { ShowFieldContainer } from "../../../../shared/show/ShowFieldContainer"
import { ToManyInputChanges } from "../_ToManyInputChanges"
import { ToManyPickerDialog } from "../_ToManyPickerDialog"
import { ToManyEditHeaderActions } from "./_ToManyEditHeaderActions"
import { Amount } from "./_ToManyEditHeaderTabs"
import { ToManyEditShowCurrentRecords } from "./_ToManyEditShowCurrentRecords"

export const ToManyEditInputField = memo(() => {
	const { disabled, label, template, changes } = useToManyInputContext()
	const list = useListContext()
	const rightCollection = useRelationContext()?.otherSide.collectionName

	return (
		<ShowFieldContainer
			className={clsx(fullWidthFieldCss, "mb-[1.5rem]")}
			label={label}
			actions={<ToManyEditHeaderActions />}
		>
			<ResourceContextProvider value={rightCollection}>
				<ToManyPickerDialog />
			</ResourceContextProvider>
			<TabsLayout
				size="small"
				sections={[
					<Amount
						key={0}
						amount={
							changes.value.removed.length === 0
								? list.total ?? 0
								: `${list.total ?? 0} - ${changes.value.removed.length}`
						}
						color="info"
					>
						Current
					</Amount>,
					<Amount key={1} amount={changes.value.added.length} color="success">
						Added
					</Amount>,
					<Amount key={2} amount={changes.value.removed.length} color="error">
						Removed
					</Amount>,
				]}
			>
				<div className="flex ">
					<TabsSection className=" min-h-[300px] w-full ">
						<ToManyEditShowCurrentRecords />
					</TabsSection>
					<TabsSection className="min-h-[300px] w-full">
						<ToManyInputChanges
							template={template}
							ids={disabled ? [] : changes.value.added}
							toggleItem={(id) => changes.toggle("added", id)}
						/>
					</TabsSection>
					<TabsSection className="min-h-[300px] w-full">
						<ToManyInputChanges
							template={template}
							ids={disabled ? [] : changes.value.removed}
							toggleItem={(id) => changes.toggle("removed", id)}
						/>
					</TabsSection>
				</div>
			</TabsLayout>
		</ShowFieldContainer>
	)
})
