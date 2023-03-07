import { notNil } from "@zmaj-js/common"
import { useMemo } from "react"
import { usePropertiesContext } from "../../context/property-context"
import { Property } from "../../types/Property"
import { RenderProperty } from "./RenderProperty"

export type RenderedProperty = Property & { rendered: JSX.Element }

export function useRenderedProperties(fields?: string[]): RenderedProperty[] {
	const properties = usePropertiesContext()

	// we have to provide key cause it will probably be rendered directly with
	// `pr.map(p => p.rendered)`, and we need to have key
	return useMemo(() => {
		if (fields) {
			return fields
				.map((f) => properties.find((p) => p.property === f))
				.filter(notNil)
				.map((p, i) => ({
					...p,
					rendered: <RenderProperty property={p} key={`${i}_${p.property}`} />,
				}))
		}
		return properties.map((p, i) => ({
			...p,
			rendered: <RenderProperty property={p} key={`${i}_${p.property}`} />,
		}))
	}, [fields, properties])
}
