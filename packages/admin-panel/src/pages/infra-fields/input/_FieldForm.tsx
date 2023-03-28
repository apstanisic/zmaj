import { shortTextDbColumnValidation } from "@admin-panel/shared/db-column-form-validation"
import { allColumnDataTypes, ignoreErrors, times } from "@zmaj-js/common"
import { memo, useMemo } from "react"
import { useWatch } from "react-hook-form"
import { useActionContext } from "../../../context/action-context"
import { StepSection } from "../../../crud-layouts/ui/steps/StepSection"
import { StepLayout } from "../../../crud-layouts/ui/steps/StepsLayout"
import { BooleanInputField } from "../../../field-components/boolean/BooleanInputField"
import { DropdownInputField } from "../../../field-components/dropdown/DropdownInputField"
import { fieldComponents } from "../../../field-components/field-components"
import { TextareaInputField } from "../../../field-components/textarea/TextareaInputField"
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
			/>

			<ManualInputField
				isRequired
				source="dataType"
				disabled={isEdit}
				Component={DropdownInputField}
				fieldConfig={{
					component: {
						dropdown: {
							choices: allColumnDataTypes.map((type) => ({ value: type })),
						},
					},
				}}
			/>

			<FieldInfoInputComponentName />
			<FieldInfoInputDefaultValue />

			<ManualInputField
				label="Value Optional"
				source="isNullable"
				Component={BooleanInputField}
				// disabled={isEdit}
				defaultValue={true}
			/>

			<ManualInputField source="label" />
			<ManualInputField source="description" Component={TextareaInputField} />
			<ManualInputField
				source="displayTemplate"
				description="For example: 'Hello {value}'. {value} will be replaced by field. Key is always 'value'."
			/>
		</StepSection>
	)
})

const Step2 = memo(() => {
	const isEdit = useActionContext() === "edit"
	return (
		<StepSection index={1}>
			<ManualInputField
				source="isUnique"
				label="Unique"
				Component={BooleanInputField}
				defaultValue={false}
				// disabled={isEdit}
				isRequired
			/>

			<ManualInputField
				source="canRead"
				Component={BooleanInputField}
				defaultValue={true}
				isRequired
			/>
			<ManualInputField
				source="canCreate"
				Component={BooleanInputField}
				defaultValue={true}
				isRequired
			/>
			<ManualInputField
				source="canUpdate"
				Component={BooleanInputField}
				defaultValue={true}
				isRequired
			/>

			{/* <ManualInputField
        source="beforeUpdate"
        label="Update Hooks"
        Component={JsonInputField}
        defaultValue={[]}
        isRequired
      /> */}

			{/* <ManualInputField
        source="beforeCreate"
        label="Create Hooks"
        Component={JsonInputField}
        defaultValue={[]}
        isRequired
      /> */}
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
								choices: times(12).map((i) => ({ value: i + 1, label: `${i + 1} / 12` })),
							},
						},
					}}
				/>
				<ManualInputField
					Component={BooleanInputField}
					source="fieldConfig.listHidden"
					label="Hide field in list page"
					defaultValue={false}
				/>
				<ManualInputField
					Component={BooleanInputField}
					source="fieldConfig.showHidden"
					label="Hide field in show page"
					defaultValue={false}
				/>
				<ManualInputField
					Component={BooleanInputField}
					source="fieldConfig.editHidden"
					label="Hide field in edit page"
					defaultValue={false}
				/>
				<ManualInputField
					Component={BooleanInputField}
					source="fieldConfig.createHidden"
					label="Hide field in create page"
					defaultValue={false}
				/>

				{Config ? (
					<>
						<p className="mx-auto max-w-xl text-center text-gray-800 dark:text-white">
							Custom UI component config and validation. This config does not have impact on API.
							This only does client side validation.
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
