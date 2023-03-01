import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { memo } from "react"
import { useActionContext } from "../../context/action-context"
import { crudLayouts } from "../../crud-layouts/layouts"

export const GeneratedInputLayout = memo((): JSX.Element => {
	const action = useActionContext()
	const config = useLayoutConfigContext()

	const layout = config.input[action === "edit" ? "edit" : "create"].layoutType

	const { Layout } = crudLayouts.getInput(layout)

	return <Layout />
})
