import { useMemo } from "react"
import { usePropertiesContext } from "../../context/property-context"
import { Property } from "../../types/Property"
import { RenderProperty } from "./RenderProperty"

export type RenderedProperty = Property & { rendered: JSX.Element }

export function useRenderedProperties(): RenderedProperty[] {
	const properties = usePropertiesContext()

	// we have to provide key cause it will probably be rendered directly with
	// `pr.map(p => p.rendered)`, and we need to have key
	return useMemo(
		() =>
			properties.map((p, i) => ({
				...p,
				rendered: <RenderProperty property={p} key={`${i}_${p.property}`} />,
			})),
		[properties],
	)
}
