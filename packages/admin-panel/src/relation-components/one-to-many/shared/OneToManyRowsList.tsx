import { ListPagination } from "@admin-panel/app-layout/list/ListPagination"
import { SimpleListLayout } from "@admin-panel/crud-layouts/list/SimpleListLayout"
import { templateParser } from "@zmaj-js/common"
import { RaRecord, useListContext } from "ra-core"

type OneToManyRowsListProps = {
	template?: string
	actions?: (record: RaRecord) => JSX.Element
	className?: string
}

export function OneToManyRowsList(props: OneToManyRowsListProps): JSX.Element {
	const { data } = useListContext()

	return (
		<>
			<SimpleListLayout
				className={props.className}
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
				endIcon={props.actions}
			/>

			{data?.length > 0 && <ListPagination perPageOptions={[5, 10, 20]} />}
		</>
	)
}
