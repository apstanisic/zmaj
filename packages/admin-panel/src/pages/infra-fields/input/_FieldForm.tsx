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
import { fieldComponents } from "../../../field-components/field-components"
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
			<FormTextInput name="collectionName" isRequired isDisabled label="Collection" />

			<FormTextInput
				name="columnName"
				isDisabled={isEdit}
				label="Column"
				isRequired
				description="Column name in database"
			/>

			<FormTextInput
				label="Field"
				name="fieldName"
				description="Field name at which value can be accessed (leave empty for default)"
			/>

			<FormSelectInput
				isRequired
				name="dataType"
				label="Data type"
				isDisabled={isEdit}
				options={columnTypes
					.filter((t) => !t.startsWith("array"))
					.map((type) => ({ value: type }))}
			/>
			<FieldInfoInputComponentName />
			<FieldInfoInputDefaultValue />

			<FormSwitchInput label="Value Optional" name="isNullable" defaultValue={true} />

			<FormTextInput name="label" label="Label" />
			<FormMultilineTextInput name="description" label="Description" />
			<FormTextInput
				name="displayTemplate"
				label="Display template"
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

			<FormSwitchInput label="Can read" name="canRead" defaultValue={true} isRequired />
			<FormSwitchInput label="Can create" name="canCreate" defaultValue={true} isRequired />
			<FormSwitchInput label="Can update" name="canUpdate" defaultValue={true} isRequired />
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
				<FormSelectInput
					isRequired
					label="Width"
					name="fieldConfig.width"
					defaultValue={12}
					options={times(12).map((i) => ({
						value: i + 1,
						label: `${i + 1} / 12`,
					}))}
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
