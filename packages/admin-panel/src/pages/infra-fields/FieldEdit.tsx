import { FieldUpdateDto } from "@zmaj-js/common"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { useInfraState } from "../../state/useInfraState"
import { FieldForm } from "./input/_FieldForm"

// const transform = (values: Partial<FieldDef>): Partial<FieldDef> => {
// 	values.fieldConfig = zodCreate(FieldConfigSchema, values.fieldConfig ?? {})
// 	return values
// }

export const FieldEdit = memo(() => {
	const infra = useInfraState()

	return (
		<GeneratedEditPage
			schema={FieldUpdateDto.zodSchema}
			onSuccess={async () => infra.refetch()}
		>
			<CustomInputLayout actions={<></>}>
				<FieldForm />
			</CustomInputLayout>
		</GeneratedEditPage>
	)
})
