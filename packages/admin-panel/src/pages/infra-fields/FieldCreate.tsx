import { FieldConfigSchema, FieldDef } from "@zmaj-js/common"
import { memo } from "react"
import { WritableDeep } from "type-fest"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { useInfraState } from "../../state/useInfraState"
import { FieldForm } from "./input/_FieldForm"

const transform = (values: Partial<WritableDeep<FieldDef>>): Partial<FieldDef> => {
	values.fieldConfig = FieldConfigSchema.parse(values.fieldConfig)
	return values
}

export const FieldCreate = memo(() => {
	const infra = useInfraState()
	return (
		<GeneratedCreatePage transform={transform} onCreate={async () => infra.refetch()}>
			<ManualInputLayout
				defaultValues={{ dataType: "short-text", componentName: "short-text" }}
				actions={<></>}
			>
				<FieldForm />
			</ManualInputLayout>
		</GeneratedCreatePage>
	)
})
