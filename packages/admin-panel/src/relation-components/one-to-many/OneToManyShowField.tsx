import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { templateParser } from "@zmaj-js/common"
import {
	RaRecord,
	useCreatePath,
	useListContext,
	useRedirect,
	useResourceDefinition,
} from "ra-core"
import { memo } from "react"
import { MdOutlineEdit, MdOutlineVisibility } from "react-icons/md"
import { OneToManyReference } from "./OneToManyReference"

type OneToManyShowFieldProps = {
	target: string
	reference: string
	label: string
	className?: string
	template?: string
}

export function OneToManyShowField(props: OneToManyShowFieldProps): JSX.Element {
	const { label, reference, target, className, template } = props

	return (
		<ShowFieldContainer className={className} label={label}>
			<OneToManyReference
				reference={reference}
				// we need fk field, not right property: should be comments.postId
				target={target}
				perPage={10}
			>
				<RowsList template={template} />
			</OneToManyReference>
		</ShowFieldContainer>
	)
}
function RowsList(props: { template?: string }): JSX.Element {
	const { data } = useListContext()

	return (
		<>
			<SimpleListLayout
				primaryText={(record) => (
					<div className="overflow-hidden">
						<p className="truncate w-full">
							{templateParser.parse(props.template ?? "", record, {
								fallback: record.id,
							})}
						</p>
					</div>
				)}
				linkType={false}
				endIcon={(record) => <RowActions record={record} />}
			/>

			{data?.length > 0 && <ListPagination />}
		</>
	)
}

const RowActions = memo((props: { record: RaRecord }) => {
	const redirect = useRedirect()
	const { hasEdit = true, hasShow, name: resource } = useResourceDefinition()
	const createPath = useCreatePath()

	return (
		<div className="flex">
			{/* Show */}
			{hasShow && (
				<IconButton
					aria-label="show"
					// role="link"
					size="small"
					onPress={() =>
						redirect(createPath({ type: "show", id: props.record.id, resource }))
					}
				>
					<MdOutlineVisibility />
				</IconButton>
			)}

			{/* Edit */}
			<IconButton
				aria-label="edit"
				isDisabled={!hasEdit}
				size="small"
				onPress={() =>
					redirect(createPath({ type: "edit", id: props.record.id, resource }))
				}
			>
				<MdOutlineEdit />
			</IconButton>
		</div>
	)
})
