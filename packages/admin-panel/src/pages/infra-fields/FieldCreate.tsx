import { FieldConfigSchema, FieldCreateSchema, zodCreate } from "@zmaj-js/common"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useInfraState } from "../../state/useInfraState"
import { FieldForm } from "./input/_FieldForm"

// const transform = (values: Partial<FieldDef>): Partial<FieldDef> => {
// 	values.fieldConfig = zodCreate(FieldConfigSchema, values.fieldConfig ?? {})
// 	return values
// }

export const FieldCreate = memo(() => {
	const infra = useInfraState()
	return (
		<GeneratedCreatePage
			schema={FieldCreateSchema}
			onSuccess={async () => infra.refetch()}
			defaultValues={{
				dataType: "text",
				componentName: "short-text",
				fieldConfig: zodCreate(FieldConfigSchema, { component: {} }),
			}}
		>
			<CustomInputLayout actions={<></>}>
				<FieldForm />
			</CustomInputLayout>
		</GeneratedCreatePage>
	)
})
