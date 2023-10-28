import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { Tooltip } from "@admin-panel/ui/Tooltip"
import { IconButton } from "@admin-panel/ui/buttons/IconButton"
import { AnyFn, templateParser } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"
import { ListBase, ResourceContextProvider } from "ra-core"
import { memo } from "react"
import { MdUndo } from "react-icons/md"

export function OneToManyAddedItems(props: {
	added: IdType[]
	reference: string
	template?: string
	toggle: (id: IdType) => unknown
}): JSX.Element {
	if (props.added.length === 0) return <p className="my-5 text-center">No Items</p>

	return (
		<ResourceContextProvider value={props.reference}>
			<ListBase
				disableSyncWithLocation
				perPage={10}
				filter={{ id: { $in: props.added } }} //
			>
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
						rowClassName="truncate w-full overflow-hidden"
						linkType={false}
						endIcon={(r) => <UndoButton undo={() => props.toggle(r.id)} />}
					/>
					<ListPagination />
				</>
			</ListBase>
		</ResourceContextProvider>
	)
}
const UndoButton = memo((props: { undo: AnyFn }) => {
	return (
		<IconButton aria-label="Undo changes" onPress={props.undo} className="ml-auto" size="small">
			<Tooltip text="Remove added item" side="left">
				<MdUndo className="text-blue-800 " />
			</Tooltip>
		</IconButton>
	)
})
