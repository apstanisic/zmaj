import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useActionContext } from "@admin-panel/context/action-context"
import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { Form } from "ra-core"
import { memo } from "react"
import { useGeneratePropertiesAndSections } from "../../generator/layouts/use-generate-sections"
import { DefineCrudLayout } from "../DefineCrudLayout"
import { TabsLayout } from "../ui/tabs/TabsLayout"
import { TabsSection } from "../ui/tabs/TabsSection"

/**
 * Tab Input Layout
 */
const TabsForm = memo(() => {
	const action = useActionContext()
	const config =
		useResourceCollection().layoutConfig.input[action === "edit" ? "edit" : "create"]?.tabs
	const sections = useGeneratePropertiesAndSections(config)

	return (
		<Form shouldUnregister={false}>
			<TabsLayout sections={sections.map((s) => s.label)}>
				{sections.map((section, i) => (
					<TabsSection
						key={i}
						// This renders separate button for every page, todo. Fix margins and move out
						bottom={
							<div className="flex w-full justify-end">
								<SaveButton className="ml-auto" />
							</div>
						}
					>
						{section.fields.map((f) => f.rendered)}
					</TabsSection>
				))}
			</TabsLayout>
		</Form>
	)
})

export const TabsInputLayout = DefineCrudLayout({
	type: "input",
	name: "tabs",
	Layout: TabsForm,
})
