import { shortTextDbColumnValidation } from "@admin-panel/shared/db-column-form-validation"
import {
	FormMultilineTextInput,
	FormSelectInput,
	FormSwitchInput,
	FormTextInput,
} from "@admin-panel/ui/Controlled"
import { ignoreErrors, times } from "@zmaj-js/common"
import { columnTypes } from "@zmaj-js/orm"
import { memo, useMemo } from "react"
import { useWatch } from "react-hook-form"
import { useActionContext } from "../../../context/action-context"
import { StepSection } from "../../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../../crud-layouts/ui/steps/StepsLayout"
import { DropdownInputField } from "../../../field-components/dropdown/DropdownInputField"
import { fieldComponents } from "../../../field-components/field-components"
import { ManualInputField } from "../../../shared/input/ManualInputField"
import { FieldInfoInputComponentName } from "./_FieldInfoInputComponentName"
import { FieldInfoInputDefaultValue } from "./_FieldInfoInputDefaultValue"

export const FieldForm = memo(() => {
	return (
		<StepLayout sections={["Main", "Advanced", "Component Config"]}>
			<Step1 />
			<Step2 />
			<Step3 />
		</StepLayout>
	)
})

const Step1 = memo(() => {
	const isEdit = useActionContext() === "edit"

	return (
		<StepSection index={0}>
			<ManualInputField
				source="collectionName"
				fieldConfig={shortTextDbColumnValidation}
				isRequired
				disabled
			/>

			<ManualInputField
				source="columnName"
				fieldConfig={shortTextDbColumnValidation}
				disabled={isEdit}
				isRequired
				description="Column name in database"
			/>

			<ManualInputField
				source="fieldName"
				fieldConfig={shortTextDbColumnValidation}
				description="Field name at which value can be accessed (leave empty for default)"
			/>

			<FormSelectInput
				isRequired
				name="dataType"
				isDisabled={isEdit}
				options={columnTypes
					.filter((t) => !t.startsWith("array"))
					.map((type) => ({ value: type }))}
			/>

			<FieldInfoInputComponentName />
			<FieldInfoInputDefaultValue />

			<FormSwitchInput label="Value Optional" name="isNullable" defaultValue={true} />

			<FormTextInput name="label" />
			<FormMultilineTextInput name="description" />
			<FormTextInput
				name="displayTemplate"
				description="For example: 'Hello {value}'. {value} will be replaced by field. Key is always 'value'."
			/>
		</StepSection>
	)
})

const Step2 = memo(() => {
	const isEdit = useActionContext() === "edit"
	return (
		<StepSection index={1}>
			<FormSwitchInput
				name="isUnique"
				label="Unique"
				defaultValue={false}
				// disabled={isEdit}
				isRequired
			/>

			<FormSwitchInput name="canRead" defaultValue={true} isRequired />
			<FormSwitchInput name="canCreate" defaultValue={true} isRequired />
			<FormSwitchInput name="canUpdate" defaultValue={true} isRequired />
		</StepSection>
	)

	//
})

const Step3 = memo(() => {
	const componentName = useWatch({ name: "componentName" })

	const Config = useMemo(
		() => ignoreErrors(() => fieldComponents.get(componentName).InputFieldConfig),
		[componentName],
	)

	return (
		<StepSection index={2}>
			<div className="min-h-[200px]">
				<ManualInputField
					isRequired
					source="fieldConfig.width"
					Component={DropdownInputField}
					defaultValue={12}
					fieldConfig={{
						component: {
							dropdown: {
								choices: times(12).map((i) => ({
									value: i + 1,
									label: `${i + 1} / 12`,
								})),
							},
						},
					}}
				/>
				<FormSwitchInput
					name="fieldConfig.listHidden"
					label="Hide field in list page"
					defaultValue={false}
				/>
				<FormSwitchInput
					name="fieldConfig.showHidden"
					label="Hide field in show page"
					defaultValue={false}
				/>
				<FormSwitchInput
					name="fieldConfig.editHidden"
					label="Hide field in edit page"
					defaultValue={false}
				/>
				<FormSwitchInput
					name="fieldConfig.createHidden"
					label="Hide field in create page"
					defaultValue={false}
				/>

				{Config ? (
					<>
						<p className="mx-auto max-w-xl text-center text-gray-800 dark:text-white">
							Custom UI component config and validation. This config does not have
							impact on API. This only does client side validation.
						</p>
						<Config />
					</>
				) : (
					<div className="mt-8 text-center text-xl">No component config</div>
				)}
			</div>
		</StepSection>
	)
})
