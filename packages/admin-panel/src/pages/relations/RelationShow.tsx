import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { useRecord } from "@admin-panel/hooks/use-record"
import { useUserCollections } from "@admin-panel/hooks/use-user-collections"
import { Divider } from "@admin-panel/ui/Divider"
import { ResponsiveButton } from "@admin-panel/ui/ResponsiveButton"
import { CollectionMetadataCollection, RelationDef } from "@zmaj-js/common"
import { useRedirect } from "ra-core"
import { memo, useMemo } from "react"
import { MdViewList } from "react-icons/md"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { JoinManyToManyButton } from "./show/JoinManyToManyButton"
import { ShowOtherSideOfRelation } from "./show/ShowOtherSideOfRelation"
import { SplitRelationButton } from "./show/SplitRelationButton"

// Display button to show collection page
function GoToCollection(): JSX.Element {
	const relation = useRecord<RelationDef>()
	const redirect = useRedirect()

	const cols = useUserCollections()
	const col = useMemo(
		() => cols.find((t) => t.tableName === relation?.tableName),
		[cols, relation?.tableName],
	)

	if (!col) return <></>

	return (
		<ResponsiveButton
			icon={<MdViewList />}
			onClick={() => redirect("show", CollectionMetadataCollection.collectionName, col.id)}
			label="Collection"
		/>
	)
}

export const RelationShow = memo(() => {
	const onDelete = useOnInfraPropertyDelete()
	return (
		<GeneratedShowPage
			// onDelete={async () => infra.refetch()}
			disableDeleteRedirect
			onDelete={onDelete}
			startButtons={
				<>
					<ShowOtherSideOfRelation />
					<SplitRelationButton />
					<JoinManyToManyButton />
					<GoToCollection />
				</>
			}
		>
			<div className="grid grid-cols-2 gap-3">
				<ManualShowField source="type" className="col-span-2" />
				<Divider className="col-span-2" />

				<ManualShowField source="tableName" label="Table 1" />
				<ManualShowField source="otherSide.tableName" label="Table 2" />
				<ManualShowField source="columnName" label="Column 1" />
				<ManualShowField source="otherSide.columnName" label="Column 2" />

				<Divider className="col-span-2" />

				<div className="col-span-2 grid w-4/5 gap-y-3 md:w-2/3">
					<ManualShowField source="propertyName" label="Property Name" />
					<ManualShowField source="relation.label" label="Label" />
					<ManualShowField source="relation.template" label="Template" />
				</div>
			</div>
		</GeneratedShowPage>
	)
})
