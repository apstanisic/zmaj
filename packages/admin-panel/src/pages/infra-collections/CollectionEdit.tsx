import { shortTextDbColumnValidation } from "@admin-panel/shared/db-column-form-validation"
import { FormJsonInput, FormSwitchInput, FormTextInput } from "@admin-panel/ui/Controlled"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { useInfraState } from "../../state/useInfraState"

export const CollectionEdit = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedEditPage onEdit={async (col: RaRecord) => infra.refetch()}>
			<CustomInputLayout>
				<FormTextInput isDisabled name="tableName" />
				<ManualInputField
					source="collectionName"
					fieldConfig={shortTextDbColumnValidation}
				/>

				<FormTextInput name="label" />
				<FormTextInput name="displayTemplate" />
				<FormSwitchInput name="disabled" />
				<FormSwitchInput name="hidden" />
				<FormJsonInput name="layoutConfig" />
			</CustomInputLayout>
		</GeneratedEditPage>
	)
})
