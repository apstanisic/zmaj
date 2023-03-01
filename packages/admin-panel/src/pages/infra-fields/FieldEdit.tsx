import { useOnInfraPropertyDelete } from "@admin-panel/hooks/use-on-infra-property-delete"
import { FieldConfigSchema, FieldDef } from "@zmaj-js/common"
import { memo } from "react"
import { WritableDeep } from "type-fest"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { useInfraState } from "../../state/useInfraState"
import { FieldForm } from "./input/_FieldForm"

const transform = (values: Partial<WritableDeep<FieldDef>>): Partial<FieldDef> => {
	values.fieldConfig = FieldConfigSchema.parse(values.fieldConfig)
	return values
}

export const FieldEdit = memo(() => {
	const infra = useInfraState()
	const onDelete = useOnInfraPropertyDelete()

	return (
		<GeneratedEditPage
			disableDeleteRedirect
			onDelete={onDelete}
			transform={transform}
			onEdit={async () => infra.refetch()}
		>
			<ManualInputLayout actions={<></>}>
				<FieldForm />
			</ManualInputLayout>
		</GeneratedEditPage>
	)
})
