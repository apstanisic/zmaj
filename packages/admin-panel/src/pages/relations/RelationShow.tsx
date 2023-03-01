import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { Divider } from "@admin-panel/ui/Divider"
import { memo } from "react"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { ManualShowField } from "../../shared/show/ManualShowField"
import { JoinManyToManyButton } from "./show/JoinManyToManyButton"
import { ShowOtherSideOfRelation } from "./show/ShowOtherSideOfRelation"
import { SplitRelationButton } from "./show/SplitRelationButton"

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
