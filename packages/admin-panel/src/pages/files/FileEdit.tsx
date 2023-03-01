import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { TextareaInputField } from "../../field-components/textarea/TextareaInputField"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"
import { ManualInputField } from "../../shared/input/ManualInputField"

export const FileEdit = memo(() => (
	<GeneratedEditPage>
		<ManualInputLayout>
			<ManualInputField source="name" />
			<ManualInputField source="description" Component={TextareaInputField} />
			{/* <ManualInputField source="folderPath" /> */}
		</ManualInputLayout>
	</GeneratedEditPage>
))
