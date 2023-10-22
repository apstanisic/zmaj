import { FormJsonInput, FormSwitchInput, FormTextInput } from "@admin-panel/ui/Controlled"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { useInfraState } from "../../state/useInfraState"

export const CollectionEdit = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedEditPage onSuccess={async (col: RaRecord) => infra.refetch()}>
			<CustomInputLayout>
				<FormTextInput label="Table name" isDisabled name="tableName" />
				<FormTextInput label="Collection name" name="collectionName" />

				<FormTextInput label="Label" name="label" />
				<FormTextInput label="Template" name="displayTemplate" />
				<FormSwitchInput label="Disabled" name="disabled" />
				<FormSwitchInput label="Hidden" name="hidden" />
				<FormJsonInput label="Layout config" name="layoutConfig" />
			</CustomInputLayout>
		</GeneratedEditPage>
	)
})
