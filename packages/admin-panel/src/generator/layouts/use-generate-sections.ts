import { LayoutConfigSections, notNil } from "@zmaj-js/common"
import { useMemo } from "react"
import { RenderedProperty, useRenderedProperties } from "../properties/use-rendered-properties"

export type RenderedSection = { name: string; label: string; fields: RenderedProperty[] }

/**
 * We split properties
 */
// export function useGeneratePropertiesAndSections(config: LayoutConfigSections): RenderedSection[] {
// 	const action = useActionContext()
// 	const properties = useRenderedProperties()
// 	const config = useLayoutConfigContext()

// 	return useMemo(() => {
// 		if (action === "list") throwInApp("37923")
// 		const sections =
// 			action === "show" ? config.show.fieldsLayout : config.input[action].fieldsLayout

// 		if (sections.type === "direct") {
// 			return [
// 				{
// 					name: "Values",
// 					label: "Values",
// 					fields: sections.fields
// 						.map((field) => properties.find((p) => p.property === field))
// 						.filter(notNil),
// 				},
// 			]
// 		} else if (sections.type === "default") {
// 			return [{ label: "Values", fields: properties, name: "Values" }]
// 		} else {
// 			const takenIndex: number[] = []

// 			const defined = sections.sections.map((sec, i): RenderedSection => {
// 				const inSection: RenderedProperty[] = sec.fields
// 					.map((fieldName) => {
// 						const index = properties.findIndex((pr) => pr.property === fieldName)
// 						// if field does not exist, ignore it
// 						// it might happen when user deletes field, but it remains here
// 						if (index === -1) return
// 						const property = properties[index]!
// 						takenIndex.push(index)
// 						return property
// 					})
// 					.filter(notNil)

// 				return { label: sec.label ?? sec.name, name: sec.name, fields: inSection }
// 			})
// 			if (sections.unsortedFieldsSection === false) return defined

// 			const notIncluded = properties.filter((p, i) => !takenIndex.includes(i))

// 			if (notIncluded.length > 0) {
// 				defined.push({
// 					label: sections.unsortedFieldsSection,
// 					fields: notIncluded,
// 					name: sections.unsortedFieldsSection,
// 				})
// 			}
// 			return defined
// 		}
// 	}, [action, config.input, config.show.fieldsLayout, properties])
// }

// declare global {
// 	interface ArrayConstructor {
// 		isArray(arg: ReadonlyArray<any> | any): arg is ReadonlyArray<any>
// 	}
// }

export function getSections(
	sections: LayoutConfigSections,
	properties: RenderedProperty[],
): RenderedSection[] {
	const takenIndex: number[] = []
	if (!sections) return [{ fields: properties, label: "All", name: "all" }]

	const defined = sections.sections.map((sec, i): RenderedSection => {
		const inSection: RenderedProperty[] = sec.fields
			.map((fieldName) => {
				const index = properties.findIndex((pr) => pr.property === fieldName)
				// if field does not exist, ignore it
				// it might happen when user deletes field, but it remains here
				if (index === -1) return
				const property = properties[index]!
				takenIndex.push(index)
				return property
			})
			.filter(notNil)

		return { label: sec.label ?? sec.name, name: sec.name, fields: inSection }
	})
	if (sections.unsortedFieldsSection === null) return defined

	const notIncluded = properties.filter((p, i) => !takenIndex.includes(i))

	if (notIncluded.length > 0) {
		defined.push({
			label: sections.unsortedFieldsSection,
			fields: notIncluded,
			name: sections.unsortedFieldsSection,
		})
	}
	return defined
}
export function useGeneratePropertiesAndSections(
	sections: LayoutConfigSections,
): RenderedSection[] {
	const properties = useRenderedProperties()
	return useMemo(() => getSections(sections, properties), [properties, sections])
}
