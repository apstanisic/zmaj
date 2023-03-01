import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useGeneratePropertiesAndSections } from "@admin-panel/generator/layouts/use-generate-sections"
import { Form } from "ra-core"
import { memo } from "react"
import { DefineCrudLayout } from "../DefineCrudLayout"
import { LayoutSection } from "../ui/LayoutSection"

/**
 * Default input layout
 */
const SimpleInputLayout = memo(() => {
	// const properties = useRenderedProperties()
	const properties = useGeneratePropertiesAndSections()

	return (
		<Form>
			<LayoutSection largeGap>
				{properties.flatMap((p) => p.fields).flatMap((f) => f.rendered)}
			</LayoutSection>
			<div className="mt-6 flex w-full justify-end">
				<SaveButton />
			</div>
		</Form>
	)
})

//warnWhenUnsavedChanges

export const DefaultInputLayout = DefineCrudLayout({
	type: "input",
	name: "simple",
	Layout: SimpleInputLayout,
})
