import { useLayoutConfig } from "@admin-panel/context/layout-config-context"
import { memo } from "react"
import { crudLayouts } from "../../crud-layouts/layouts"

export const GeneratedEditLayout = memo((): JSX.Element => {
	const config = useLayoutConfig()

	const layout = config.input.edit?.type

	const { Layout } = crudLayouts.getInput(layout)

	return <Layout />
})
