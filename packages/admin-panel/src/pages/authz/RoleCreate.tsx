import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { TextareaInputField } from "../../field-components/textarea/TextareaInputField"
import { GeneratedCreatePage } from "../../generator/pages/GeneratedCreatePage"
import { ManualInputField } from "../../shared/input/ManualInputField"

export const RoleCreate = memo(() => (
	<GeneratedCreatePage>
		<ManualInputLayout>
			<ManualInputField source="name" />
			<ManualInputField source="description" Component={TextareaInputField} />
		</ManualInputLayout>
	</GeneratedCreatePage>
))
