import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { memo } from "react"
import { useGeneratePropertiesAndSections } from "../../generator/layouts/use-generate-sections"

import { DefineCrudLayout } from "../DefineCrudLayout"
import { TabsLayout } from "../ui/tabs/TabsLayout"
import { TabsSection } from "../ui/tabs/TabsSection"

/**
 * Tab Layout
 * Every section is one tab
 */
const GeneratedTabsShowLayout = memo(() => {
	const config = useResourceCollection().layoutConfig.show.layouts?.tabs
	const sections = useGeneratePropertiesAndSections(config)
	return (
		<TabsLayout sections={sections.map((s) => s.label)}>
			{sections.map((section, i) => (
				<TabsSection key={i}>{section.fields.map((f) => f.rendered)}</TabsSection>
			))}
		</TabsLayout>
	)
})

export const TabsShowLayout = DefineCrudLayout({
	type: "show",
	name: "tabs",
	Layout: GeneratedTabsShowLayout,
})
