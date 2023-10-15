import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { FormMultilineTextInput, FormTextInput } from "@admin-panel/ui/Controlled"
import { memo } from "react"
import { ManualInputLayout } from "../../crud-layouts/input/ManualInputLayout"
import { GeneratedEditPage } from "../../generator/pages/GeneratedEditPage"

export const FileEdit = memo(() => {
	useHtmlTitle("EditFiles")

	return (
		<GeneratedEditPage>
			<ManualInputLayout>
				<FormTextInput name="name" label="Name" />
				<FormMultilineTextInput name="description" label="Description" />
			</ManualInputLayout>
		</GeneratedEditPage>
	)
})
