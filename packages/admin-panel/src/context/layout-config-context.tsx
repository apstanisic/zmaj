import { useResourceCollection } from "@admin-panel/hooks/use-resource-collection"
import { LayoutConfig, LayoutConfigSchema } from "@zmaj-js/common"

export function useLayoutConfig(): LayoutConfig {
	try {
		// hook will throw if there is no resource
		const col = useResourceCollection()
		return col.layoutConfig
	} catch (error) {
		return LayoutConfigSchema.parse({})
	}
}

export function useShowLayoutConfig(): LayoutConfig["show"] {
	const config = useLayoutConfig()
	return config.show
}

export function useEditLayoutConfig(): LayoutConfig["input"]["edit"] {
	const config = useLayoutConfig()
	return config.input.edit
}

export function useCreateLayoutConfig(): LayoutConfig["input"]["create"] {
	const config = useLayoutConfig()
	return config.input.create
}
export function useListLayoutConfig(): LayoutConfig["list"] {
	const config = useLayoutConfig()
	return config.list
}
