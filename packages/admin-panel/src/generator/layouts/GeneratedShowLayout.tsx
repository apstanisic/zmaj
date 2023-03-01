import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { memo } from "react"
import { crudLayouts } from "../../crud-layouts/layouts"

/**
 * Component that renders relevant layout for `CollectionInfo`
 * It expects collection info in context.
 *
 */
export const GeneratedShowLayout = memo((): JSX.Element => {
	const { layoutType } = useLayoutConfigContext().show
	const { Layout } = crudLayouts.getShow(layoutType)

	return <Layout />
})
