import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { FormMultilineTextInput, FormTextInput } from "@admin-panel/ui/Controlled"
import { memo } from "react"
import { CustomInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"

export const FileEdit = memo(() => {
	useHtmlTitle("EditFiles")

	return (
		<GeneratedEditPage>
			<CustomInputLayout>
				<FormTextInput name="name" label="Name" />
				<FormMultilineTextInput name="description" label="Description" />
			</CustomInputLayout>
		</GeneratedEditPage>
	)
})
