import { ShowPageActions } from "@admin-panel/app-layout/show/ShowPageActions"
import { ResponsiveButton } from "@admin-panel/ui/buttons/ResponsiveButton"
import { CollectionDef } from "@zmaj-js/common"
import {
	useRedirect,
	useResourceDefinitionContext,
	useResourceDefinitions,
	useShowContext,
} from "ra-core"
import { memo } from "react"
import { MdNorthEast } from "react-icons/md"
import { TabsLayout } from "../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { BooleanShowField } from "../../field-components/boolean/BooleanShowField"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { useInfraState } from "../../state/useInfraState"
import { CollectionShowFields } from "./show/_CollectionShowFields"
import { CollectionShowRelations } from "./show/_CollectionShowRelations"

export const CollectionShow = memo(() => {
	const infraState = useInfraState()
	const manageResources = useResourceDefinitionContext()

	return (
		<GeneratedShowPage
			actions={
				<>
					<VisitResourceButton />
					<ShowPageActions
						onDelete={async (res) => {
							const col = res as CollectionDef
							await infraState.refetch()
							// version.refresh()
							manageResources.unregister({
								name: col.tableName,
								hasCreate: false,
								hasEdit: false,
								hasList: false,
								hasShow: false,
							})
						}}
					/>
				</>
			}
		>
			<TabsLayout sections={["Main", "Fields", "Relations"]}>
				{/* Tab 1 */}
				<TabsSection index={0}>
					<ManualShowField source="id" />
					<ManualShowField source="collectionName" />
					<ManualShowField source="tableName" />
					<ManualShowField source="label" />
					<ManualShowField source="pkField" label="Primary Key Field" />
					<ManualShowField source="pkType" label="Primary Key Type" />
					<ManualShowField source="description" />
					<ManualShowField source="displayTemplate" />
					<ManualShowField source="hidden" Component={BooleanShowField} />
					<ManualShowField source="isJunctionTable" Component={BooleanShowField} />
					{/* <ManualShowField source="hidden" Component={BooleanShowField} /> */}
					{/* <ManualShowField source="validation" Component={JsonShowField} /> */}
				</TabsSection>

				{/* Tab 2 */}
				<CollectionShowFields />

				{/* Tab 3 */}
				<CollectionShowRelations />
			</TabsLayout>
		</GeneratedShowPage>
	)
})

/**
 * This button is useful when collection is hidden, this enables us to still see it's content
 * without cluttering sidebar
 */
function VisitResourceButton(): JSX.Element {
	const show = useShowContext<CollectionDef>()
	const redirect = useRedirect()
	const allResources = useResourceDefinitions()

	const res = allResources[show.record?.collectionName ?? "_"]

	if (res?.hasList !== true) return <></>

	return (
		<ResponsiveButton
			icon={<MdNorthEast />}
			onPress={() => redirect("list", res.name)}
			label="Visit"
		/>
	)
}
