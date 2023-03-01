import { useRecord } from "@admin-panel/hooks/use-record"
import { isNil } from "@zmaj-js/common"
import {
	ListContextProvider,
	ResourceContextProvider,
	useRecordContext,
	useReferenceManyFieldController,
	UseReferenceManyFieldControllerParams,
	useResourceContext,
} from "ra-core"
import { memo, ReactNode } from "react"
import { SetOptional } from "type-fest"
import { ShowFieldContainer } from "../../shared/show/ShowFieldContainer"
import { ToManyShowRows } from "../to-many/show/ToManyShowRows"
import { OneToManyInternalProps } from "./OneToManyInternalProps.type"

const MyReferenceManyField = (
	props: SetOptional<UseReferenceManyFieldControllerParams, "resource"> & { children?: ReactNode },
): JSX.Element => {
	const {
		children,
		filter,
		page = 1,
		perPage = 25,
		reference,
		resource,
		sort,
		source = "id",
		target,
	} = props
	const record = useRecordContext(props)
	const rs = useResourceContext()

	const controllerProps = useReferenceManyFieldController({
		filter,
		page,
		perPage,
		record,
		reference,
		resource: resource ?? rs,
		sort,
		source,
		target,
	})

	return (
		<ResourceContextProvider value={reference}>
			<ListContextProvider value={controllerProps}>
				{children}
				{/* {pagination} */}
			</ListContextProvider>
		</ResourceContextProvider>
	)
}

export const OneToManyShowField = memo((props: OneToManyInternalProps) => {
	const { relation } = props
	const record = useRecord()

	// logs error in console
	if (isNil(record?.id)) return <></>

	return (
		<ShowFieldContainer className={props.fullWidthClasses} label={props.label}>
			<MyReferenceManyField
				// fullWidth
				reference={relation.otherSide.collectionName}
				// we need fk field, not right property: should be comments.postId
				target={relation.otherSide.fieldName}
				perPage={10}
			>
				<ToManyShowRows template={props.template} />
			</MyReferenceManyField>
		</ShowFieldContainer>
	)
})
