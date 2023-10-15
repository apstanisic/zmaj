import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { RaRecord, useRedirect } from "ra-core"
import { memo } from "react"
import { MdOutlineEdit, MdOutlineVisibility } from "react-icons/md"
import { useRelationContext } from "../../../context/relation-context"
import { useIsAllowed } from "../../../hooks/use-is-allowed"
import { throwInApp } from "../../../shared/throwInApp"
import { useRelationRightSide } from "../../use-relation-right-side"

type ToManyShowRowActionsProps = {
	/**
	 * This is not record from context
	 */
	record: RaRecord
}

/**
 *
 */
export const ToManyShowRowActions = memo((props: ToManyShowRowActionsProps) => {
	const redirect = useRedirect()
	const relation = useRelationContext() ?? throwInApp("79234")
	const rightSide = useRelationRightSide()

	const canEdit = useIsAllowed("update", rightSide ?? "_")
	// const canDelete = useIsAllowed("delete", rightSide ?? "_")

	return (
		<div className="flex">
			{/* Show */}
			<IconButton
				aria-label="show"
				// role="link"
				onPress={() =>
					redirect("show", `/${relation.otherSide.collectionName}`, props.record.id)
				}
			>
				<MdOutlineVisibility />
			</IconButton>

			{/* Edit */}
			<IconButton
				aria-label="edit"
				isDisabled={!canEdit}
				// role="link"
				onPress={() =>
					redirect("edit", `/${relation.otherSide.collectionName}`, props.record.id)
				}
			>
				<MdOutlineEdit />
			</IconButton>
		</div>
	)
})
