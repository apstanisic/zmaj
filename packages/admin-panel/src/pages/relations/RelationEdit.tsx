import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { useInfraState } from "@admin-panel/state/useInfraState"
import { RelationDef, RelationUpdateDto } from "@zmaj-js/common"
import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { shortTextDbColumnValidation } from "../../shared/db-column-form-validation"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { Columns } from "../../ui/Columns"

export const RelationEdit = memo(() => {
	const onDelete = useOnInfraPropertyDelete()
	const infra = useInfraState()
	return (
		<GeneratedEditPage
			disableDeleteRedirect
			onDelete={onDelete}
			onEdit={async () => infra.refetch()}
			transform={(r: RelationDef) => new RelationUpdateDto(r.relation)}
		>
			<ManualInputLayout>
				<ManualInputField source="type" disabled />
				<Columns>
					<ManualInputField source="tableName" disabled />
					<ManualInputField source="columnName" disabled />
				</Columns>
				<Columns>
					<ManualInputField source="otherSide.tableName" disabled />
					<ManualInputField source="otherSide.columnName" disabled />
				</Columns>
				{/* don't make this full width, to signal it to the user that this is for the left side */}
				<div className="w-4/5 md:w-2/3">
					<ManualInputField
						source="relation.propertyName"
						fieldConfig={shortTextDbColumnValidation}
					/>
					<ManualInputField source="relation.label" />
					<ManualInputField source="relation.template" />
				</div>
			</ManualInputLayout>
		</GeneratedEditPage>
	)
})
