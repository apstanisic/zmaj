import { FormTextInput } from "@admin-panel/ui/Controlled"
import { FieldConfig } from "@zmaj-js/common"
import { dbColumnValidation } from "../../../shared/db-column-form-validation"
import { Columns } from "../../../ui/Columns"

export function JunctionOptions(): JSX.Element {
	const description = "Leave empty for default value"
	const fieldConfig: FieldConfig = { component: { "short-text": dbColumnValidation } }
	return (
		<Columns>
			<FormTextInput
				name="junction.left.column"
				label="Junction Field"
				description={description}
			/>
			<FormTextInput name="junction.table" label="Junction Table" description={description} />
			<FormTextInput
				name="junction.right.column"
				label="Junction Field"
				description={description}
			/>
		</Columns>
	)
}
