import { generateContext } from "@admin-panel/utils/generate-context"
import { LayoutConfig, LayoutConfigSchema } from "@zmaj-js/common"

export const [LayoutConfigContextProvider, useLayoutConfigContext] = generateContext<LayoutConfig>(
	LayoutConfigSchema.parse({}),
)
