import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { memo } from "react"
import { crudLayouts } from "../../crud-layouts/layouts"

/**
 * Generated List layout
 */
export const GeneratedListLayout = memo((): JSX.Element => {
	const config = useLayoutConfigContext().list

	const { Layout } = crudLayouts.getList(config.layoutType)

	return <Layout />
})
