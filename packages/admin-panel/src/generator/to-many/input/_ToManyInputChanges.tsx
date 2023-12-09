import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { useToManyInputContext } from "@admin-panel/context/to-many-input-context"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { AnyFn, templateParser, truncate } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"
import { ListBase, ResourceContextProvider, useListContext } from "ra-core"
import { memo } from "react"
import { MdUndo } from "react-icons/md"

type ToManyInputChangesProps = {
	ids: IdType[]
	toggleItem: (id: IdType) => unknown
	template: string
}

/**
 * Show changed records. It's used for both added and removed records
 */
export const ToManyInputChanges = memo(({ ids, toggleItem }: ToManyInputChangesProps) => {
	const rightCollection = useRelationContext()?.otherSide.collectionName

	const { template } = useToManyInputContext()
	// const href = useHref(`/${rightCollection}/TO_REPLACE/show`)
	if (ids.length === 0) return <p className="my-5 text-center">No Items</p>

	return (
		<ResourceContextProvider value={rightCollection}>
			<ListBase
				disableSyncWithLocation
				perPage={10}
				filter={{ id: { $in: ids } }} //
			>
				<>
					<SimpleListLayout
						primaryText={(r) =>
							truncate(templateParser.parse(template, r), { length: 100 })
						}
						linkType={false}
						endIcon={(r) => <UndoButton undo={() => toggleItem(r.id)} />}
					/>
					<Pagination />
				</>
			</ListBase>
		</ResourceContextProvider>
	)
})

/**
 * We need access to list context
 */
function Pagination() {
	const ctx = useListContext()

	return ctx.data?.length > 0 ? <ListPagination /> : <></>
}

const UndoButton = memo((props: { undo: AnyFn }) => {
	return (
		<IconButton aria-label="Undo changes" onPress={props.undo} className="ml-auto">
			<Tooltip text="Remove added item" side="left">
				<MdUndo className="text-blue-800 " />
			</Tooltip>
		</IconButton>
	)
})
