import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { FileInfo, IdRecord, templateParser, truncate } from "@zmaj-js/common"
import { useListContext } from "ra-core"
import { memo, ReactNode } from "react"
import { DisplayZmajFile } from "../../../ui/display-file"
import { ToManyShowRowActions } from "./ToManyShowRowActions"

type ToManyShowItemsProps = {
	template: string
}

type ShowManyRowsProps = {
	// data?: IdRecord[]
	template: string
	collectionName?: string
	actions?: (row: IdRecord) => ReactNode
}

export const ShowManyRows = memo((props: ShowManyRowsProps) => {
	const { data } = useListContext()
	return (
		<>
			<SimpleListLayout
				primaryText={(record) =>
					truncate(templateParser.parse(props.template, record), { length: 100 })
				}
				startIcon={(record) =>
					props.collectionName === "zmajFiles" && (
						<DisplayZmajFile
							className="h-12 w-12 overflow-hidden rounded-full"
							file={record as Partial<FileInfo>}
							size="thumbnail"
						/>
					)
				}
				linkType={false}
				endIcon={(record) =>
					props.actions && (
						<div>
							<ToManyShowRowActions record={record} />
						</div>
					)
				}
			/>

			{data?.length > 0 && <ListPagination />}
		</>
	)
})

export const ToManyShowRows = memo((props: ToManyShowItemsProps) => {
	// const list = useListContext()
	const relation = useRelationContext()

	return (
		<ShowManyRows
			// data={list.data}
			template={props.template}
			collectionName={relation?.otherSide.collectionName}
			actions={(record) => <ToManyShowRowActions record={record} />}
		/>
	)
})
