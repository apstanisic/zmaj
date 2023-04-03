import { FieldConfigSchema, FieldDef, zodCreate } from "@zmaj-js/common"
import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useInfraState } from "../../state/useInfraState"
import { FieldForm } from "./input/_FieldForm"

const transform = (values: Partial<FieldDef>): Partial<FieldDef> => {
	values.fieldConfig = zodCreate(FieldConfigSchema, values.fieldConfig ?? {})
	return values
}

export const FieldCreate = memo(() => {
	const infra = useInfraState()
	return (
		<GeneratedCreatePage transform={transform} onCreate={async () => infra.refetch()}>
			<ManualInputLayout
				defaultValues={{
					dataType: "short-text",
					componentName: "short-text",
					fieldConfig: zodCreate(FieldConfigSchema, { component: {} }),
				}}
				actions={<></>}
			>
				{/* <Tool /> */}
				<FieldForm />
			</ManualInputLayout>
		</GeneratedCreatePage>
	)
})
