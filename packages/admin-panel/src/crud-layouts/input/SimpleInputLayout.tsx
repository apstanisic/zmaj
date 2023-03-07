import { SaveButton } from "@admin-panel/app-layout/buttons/SaveButton"
import { useActionContext } from "@admin-panel/context/action-context"
import { useCollectionContext } from "@admin-panel/context/collection-context"
import { useRenderedProperties } from "@admin-panel/generator/properties/use-rendered-properties"
import { Form } from "ra-core"
import { memo } from "react"
import { DefineCrudLayout } from "../DefineCrudLayout"
import { LayoutSection } from "../ui/LayoutSection"

/**
 * Default input layout
 */
const SimpleInputLayout = memo(() => {
	const action = useActionContext() === "edit" ? "edit" : "create"
	const fields = useCollectionContext().layoutConfig.input?.[action]?.simple?.fields
	const properties = useRenderedProperties(fields)

	return (
		<Form>
			<LayoutSection largeGap>{properties.flatMap((f) => f.rendered)}</LayoutSection>
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
