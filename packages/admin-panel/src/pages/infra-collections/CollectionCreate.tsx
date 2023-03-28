import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { JsonInputField } from "@admin-panel/field-components/json/JsonInputField"
import { LayoutConfigSchema } from "@zmaj-js/common"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { BooleanInputField } from "../../field-components/boolean/BooleanInputField"
import { DropdownInputField } from "../../field-components/dropdown/DropdownInputField"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { shortTextDbColumnValidation } from "../../shared/db-column-form-validation"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { useInfraState } from "../../state/useInfraState"

export const CollectionCreate = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedCreatePage onCreate={async (col: RaRecord) => infra.refetch()}>
			<ManualInputLayout
				actions={<></>}
				defaultValues={{ layoutConfig: LayoutConfigSchema.parse({}) }}
			>
				<StepLayout sections={["Database", "Additional"]} endButton={<SaveButton />}>
					<StepSection index={0}>
						<ManualInputField
							source="tableName"
							fieldConfig={shortTextDbColumnValidation}
							isRequired
						/>
						<ManualInputField
							source="collectionName"
							fieldConfig={shortTextDbColumnValidation}
							description="Customize collection name (leave empty to use camel cased table name)"
						/>

						<ManualInputField
							source="pkColumn"
							defaultValue="id"
							fieldConfig={shortTextDbColumnValidation}
							isRequired
							disabled
						/>

						<ManualInputField
							source="pkType"
							Component={DropdownInputField}
							defaultValue="uuid"
							fieldConfig={{
								component: {
									dropdown: {
										choices: [{ value: "uuid" }, { value: "auto-increment" }], //
									},
								},
							}}
							isRequired
						/>
					</StepSection>

					<StepSection index={1}>
						<ManualInputField source="label" />
						<ManualInputField source="displayTemplate" />
						<ManualInputField source="disabled" Component={BooleanInputField} />
						<ManualInputField source="hidden" Component={BooleanInputField} />
						<ManualInputField source="layoutConfig" Component={JsonInputField} defaultValue={{}} />
					</StepSection>
				</StepLayout>
			</ManualInputLayout>
		</GeneratedCreatePage>
	)
})
