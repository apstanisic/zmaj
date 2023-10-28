import { ShowFieldContainer } from "@admin-panel/shared/show/ShowFieldContainer"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { RaRecord, useCreatePath, useRedirect, useResourceDefinition } from "ra-core"
import { memo } from "react"
import { MdOutlineEdit, MdOutlineVisibility } from "react-icons/md"
import { OneToManyReference } from "./OneToManyReference"
import { OneToManyRowsList } from "./shared/OneToManyRowsList"

export type OneToManyShowFieldProps = {
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
				<OneToManyRowsList
					template={template}
					actions={(record) => <ShowRowActions record={record} />}
				/>
			</OneToManyReference>
		</ShowFieldContainer>
	)
}
const ShowRowActions = memo((props: { record: RaRecord }) => {
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
