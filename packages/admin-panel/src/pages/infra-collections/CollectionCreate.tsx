import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import {
	FormJsonInput,
	FormSelectInput,
	FormSwitchInput,
	FormTextInput,
} from "@admin-panel/ui/Controlled"
import { CollectionCreateDto, LayoutConfigSchema } from "@zmaj-js/common"
import { RaRecord } from "ra-core"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input"
import { StepSection } from "../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../crud-layouts/ui/steps/StepsLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useInfraState } from "../../state/useInfraState"

export const CollectionCreate = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedCreatePage
			onSuccess={async (col: RaRecord) => infra.refetch()}
			defaultValues={{
				layoutConfig: LayoutConfigSchema.parse({}),
			}}
			schema={CollectionCreateDto.zodSchema}
		>
			<CustomInputLayout actions={<></>}>
				<StepLayout sections={["Database", "Additional"]} endButton={<SaveButton />}>
					<StepSection index={0}>
						<FormTextInput
							label="Table name"
							name="tableName"
							isRequired
							description="Table name in database"
						/>
						<FormTextInput
							label="Collection name"
							name="collectionName"
							description="Collection name at which it will be accessed (leave empty for default)"
						/>

						<FormTextInput
							label="Primary key column"
							name="pkColumn"
							defaultValue="id"
							isRequired
							isDisabled
						/>

						<FormSelectInput
							label="Primary key type"
							name="pkType"
							defaultValue="uuid"
							options={[{ value: "uuid" }, { value: "auto-increment" }]}
							isRequired
						/>
					</StepSection>

					<StepSection index={1}>
						<FormTextInput label="Label" name="label" />
						{/* <FormTextInput
							label="Display template"
							name="displayTemplate"
							isDisabled
							description="This option is available after you add columns"
						/> */}
						<FormSwitchInput label="Disabled" name="disabled" defaultValue={false} />
						<FormSwitchInput label="Hidden" name="hidden" defaultValue={false} />
						<FormJsonInput
							label="Layout config"
							name="layoutConfig"
							defaultValue={{}}
						/>
					</StepSection>
				</StepLayout>
			</CustomInputLayout>
		</GeneratedCreatePage>
	)
})
