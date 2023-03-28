import { JsonInputField } from "@admin-panel/field-components/json/JsonInputField"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input"
import { BooleanInputField } from "../../field-components/boolean/BooleanInputField"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { useInfraState } from "../../state/useInfraState"
import { shortTextDbColumnValidation } from "@admin-panel/shared/db-column-form-validation"

export const CollectionEdit = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedEditPage onEdit={async (col: RaRecord) => infra.refetch()}>
			<ManualInputLayout>
				<ManualInputField disabled source="tableName" />
				<ManualInputField source="collectionName" fieldConfig={shortTextDbColumnValidation} />

				<ManualInputField source="label" />
				<ManualInputField source="displayTemplate" />
				<ManualInputField source="disabled" Component={BooleanInputField} />
				<ManualInputField source="hidden" Component={BooleanInputField} />
				<ManualInputField source="layoutConfig" Component={JsonInputField} />
			</ManualInputLayout>
		</GeneratedEditPage>
	)
})
