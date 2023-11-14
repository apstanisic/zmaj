import { memo } from "react"
import { useRenderedProperties } from "../../generator/properties/use-rendered-properties"
import { DefineCrudLayout } from "../DefineCrudLayout"
import { LayoutSection } from "../ui/LayoutSection"

/**
 * Simplest layout, shows fields in vertical row
 */
const ShowLayout = memo(() => {
	const properties = useRenderedProperties()

	return <LayoutSection>{properties.map((p) => p.rendered)}</LayoutSection>
})

export const SimpleShowLayout = DefineCrudLayout({
	type: "show",
	name: "simple",
	Layout: ShowLayout,
})
