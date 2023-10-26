import { useRecord } from "@admin-panel/hooks/use-record"
import {
	ListContextProvider,
	ResourceContextProvider,
	useReferenceManyFieldController,
	UseReferenceManyFieldControllerParams,
} from "ra-core"
import { ReactNode } from "react"

type OneToManyReferenceProps = UseReferenceManyFieldControllerParams & {
	children: ReactNode
}

/**
 * Only created since `ReferenceMany` is in MUI package
 */
export const OneToManyReference = (props: OneToManyReferenceProps): JSX.Element => {
	const {
		children,
		filter,
		page = 1,
		perPage = 10,
		reference,
		resource,
		sort,
		source = "id",
		target,
	} = props
	const record = useRecord()

	const controllerProps = useReferenceManyFieldController({
		filter,
		page,
		perPage,
		record,
		reference,
		resource,
		sort,
		source,
		target,
	})

	return (
		<ResourceContextProvider value={reference}>
			<ListContextProvider value={controllerProps}>{children}</ListContextProvider>
		</ResourceContextProvider>
	)
}
