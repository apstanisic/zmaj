import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import {
	FormJsonInput,
	FormSelectInput,
	FormSwitchInput,
	FormTextInput,
} from "@admin-panel/ui/Controlled"
import { LayoutConfigSchema } from "@zmaj-js/common"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { shortTextDbColumnValidation } from "../../shared/db-column-form-validation"
import { ManualInputField } from "../../shared/input/ManualInputField"
import { useInfraState } from "../../state/useInfraState"

export const CollectionCreate = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedCreatePage onCreate={async (col: RaRecord) => infra.refetch()}>
			<CustomInputLayout
				actions={<></>}
				defaultValues={{ layoutConfig: LayoutConfigSchema.parse({}) }}
			>
				<StepLayout sections={["Database", "Additional"]} endButton={<SaveButton />}>
					<StepSection index={0}>
						<ManualInputField
							source="tableName"
							fieldConfig={shortTextDbColumnValidation}
							isRequired
							description="Table name in database"
						/>
						<ManualInputField
							source="collectionName"
							fieldConfig={shortTextDbColumnValidation}
							description="Collection name at which it will be accessed (leave empty for default)"
						/>

						<ManualInputField
							source="pkColumn"
							defaultValue="id"
							fieldConfig={shortTextDbColumnValidation}
							isRequired
							disabled
						/>

						<FormSelectInput
							name="pkType"
							defaultValue="uuid"
							options={[{ value: "uuid" }, { value: "auto-increment" }]}
							isRequired
						/>
					</StepSection>

					<StepSection index={1}>
						<FormTextInput name="label" />
						<FormTextInput name="displayTemplate" />
						<FormSwitchInput name="disabled" defaultValue={false} />
						<FormSwitchInput name="hidden" defaultValue={false} />
						<FormJsonInput name="layoutConfig" defaultValue={{}} />
					</StepSection>
				</StepLayout>
			</CustomInputLayout>
		</GeneratedCreatePage>
	)
})
