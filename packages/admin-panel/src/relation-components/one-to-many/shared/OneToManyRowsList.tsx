import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { templateParser } from "@zmaj-js/common"
import { RaRecord, useListContext } from "ra-core"

type OneToManyRowsListProps = {
	template?: string
	actions?: (record: RaRecord) => JSX.Element
	className?: string
	data?: any[]
}

export function OneToManyRowsList(props: OneToManyRowsListProps): JSX.Element {
	// User can override data if they want. We will first try data, then fallback to list context
	const { data = [] } = useListContext({ data: props.data, perPage: 10 })

	return (
		<>
			<SimpleListLayout
				className={props.className}
				data={data}
				primaryText={(record) => (
					<div className="overflow-hidden">
						<p className="truncate w-full">
							{templateParser.parse(props.template ?? "{id}", record, {
								fallback: record.id,
							})}
						</p>
					</div>
				)}
				linkType={false}
				endIcon={props.actions}
			/>

			{data.length > 0 && <ListPagination perPageOptions={[5, 10, 20]} />}
		</>
	)
}
