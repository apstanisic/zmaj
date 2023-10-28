import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { IconToggleButton } from "@admin-panel/ui/IconToggleButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { isUUID, templateParser, truncate } from "@zmaj-js/common"
import { useListContext } from "ra-core"
import { memo } from "react"
import { MdDeleteOutline, MdOutlineVisibility, MdUndo } from "react-icons/md"
import { useHref } from "react-router"
import { useRelationContext } from "../../../../context/relation-context"
import { useToManyInputContext } from "../../../../context/to-many-input-context"

export const ToManyEditShowCurrentRecords = memo(() => {
	const { template, changes, disabled, deletable } = useToManyInputContext()
	const relation = useRelationContext()
	// replace with relevant id
	const href = useHref(`/${relation!.otherSide.collectionName}/TO_REPLACE/show`)
	const { data } = useListContext()

	return (
		<>
			<SimpleListLayout
				primaryText={(r) => truncate(templateParser.parse(template, r), { length: 100 })}
				linkType={false}
				endIcon={(r) => {
					const isRemoved = changes.value.removed.includes(r?.id)
					const showRecordUrl = href.replace("TO_REPLACE", String(r?.id ?? ""))
					return (
						<>
							<Tooltip text="View record" side="left">
								{/* There has to be prettier way, to still use this button, and not link */}
								<IconButton
									aria-label={`Display ${truncated(
										templateParser.parse(template, r),
									)}`}
									// label="Display"
									// open in new tab since opening in same tab will destroy form
									onPress={() => window.open(showRecordUrl, "_blank")}
								>
									<MdOutlineVisibility />
								</IconButton>
							</Tooltip>

							<Tooltip
								text={
									!deletable
										? "Value can't be null. You must either delete record, or change its value"
										: isRemoved
										? "Restore record"
										: "Mark record relation for deletion"
								}
								side="left"
							>
								<IconToggleButton
									// data-testid={(isRemoved ? "Undo " : "Remove ") + templateParser.parse(template, r)}
									aria-label={
										(isRemoved ? "Undo " : "Remove ") +
										truncated(templateParser.parse(template, r))
									}
									// label={isRemoved ? "Undo" : "Remove"}
									type="button"
									onPress={() => changes.toggle("removed", r.id)}
									isDisabled={disabled || !deletable}
									className="ml-auto"
									isOn={isRemoved}
									on={<MdUndo className="text-info" />}
									off={<MdDeleteOutline className="text-error" />}
								/>
							</Tooltip>
						</>
					)
				}}
			/>
			{data?.length > 0 && <ListPagination />}
		</>
	)
})

const truncated = (parsed: string): string => {
	return isUUID(parsed) ? truncate(parsed, { length: 10 }) : truncate(parsed, { length: 40 })
}
