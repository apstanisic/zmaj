import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { clsx } from "clsx"
import { ListBase, ListControllerProps, useListContext } from "ra-core"
import { ReactNode } from "react"
import { useCollectionContext } from "../../context/collection-context"
import { throwInApp } from "../../shared/throwInApp"
import { CurrentlyActiveFilters } from "./CurrentlyActiveFilters"
import { FilterDialog } from "./filter-dialog/FilterDialog"
import { ListActions } from "./ListActions"
import { ListBulkActions } from "./ListBulkActions"
import { ListPagination } from "./ListPagination"
import { ListQuickFilterInput } from "./ListQuickFilterInput"

export type ListPageLayoutProps = {
	/** Children to render */
	children: ReactNode
	/** Current page sidebar */
	sidebar?: ReactNode
	/** Bulk action that are added on the beginning of the row */
	bulkActionsStart?: ReactNode
	/** Bulk action that are added on the end of the row */
	bulkActionsEnd?: ReactNode
	/** Should we hide bulk actions that are show by default */
	bulkHideDefaultActions?: boolean
	/** Action that are added on the beginning of the row */
	actionsStart?: ReactNode
	/** Action that are added on the end of the row */
	actionsEnd?: ReactNode
	/** Should we hide actions that are show by default */
	hideDefaultActions?: boolean
	/** Title of the page */
	title?: string | ReactNode
	/** Should we completely hide the toolbar */
	hideToolbar?: boolean
	/** Query options passed down to `ListBase`. From `react-query` */
	queryOptions?: ListControllerProps["queryOptions"]
}

/**
 * Page layout for List
 */
export function ListPageLayout(props: ListPageLayoutProps): JSX.Element {
	const { children, queryOptions, ...passthrough } = props
	const config = useLayoutConfigContext().list

	return (
		<ListBase
			queryOptions={queryOptions}
			exporter={false}
			filter={config.permanentFilter}
			perPage={config.perPage?.default}
			sort={config.defaultSort}
		>
			<ListLayout {...passthrough}>{children}</ListLayout>
		</ListBase>
	)
}

/**
 * This needs to be separate function so we can access `useListContext`
 */
function ListLayout(props: ListPageLayoutProps): JSX.Element {
	const list = useListContext(props)
	const collection = useCollectionContext() ?? throwInApp("572934")
	const config = useLayoutConfigContext().list
	const title = collection.label ?? collection.tableName

	return (
		<div className="flex w-full">
			{props.sidebar}
			<div className="crud-content">
				<div className="my-2 items-center gap-x-2 gap-y-4 sm:flex sm:justify-between">
					{props.title && typeof props.title !== "string" ? (
						props.title
					) : (
						<h1 className="m-2 text-xl">{props.title ?? title}</h1>
					)}
					<ListQuickFilterInput />
				</div>
				<FilterDialog />
				<CurrentlyActiveFilters />
				{/* {list.selectedIds.length > 0 ? <ListBulkActions /> : <ListActions />} */}
				<div className={clsx("flex h-20 w-full items-center ", props.hideToolbar && "hidden")}>
					{list.selectedIds.length > 0 ? (
						<ListBulkActions
							hideDefaultActions={props.bulkHideDefaultActions}
							endButtons={props.bulkActionsEnd}
							startButtons={props.bulkActionsStart}
						/>
					) : (
						<ListActions
							actionsEnd={props.actionsEnd}
							actionsStart={props.actionsStart}
							hideDefaultActions={props.hideDefaultActions}
						/>
					)}
				</div>
				{props.children}

				{config.hidePagination !== true && (
					<ListPagination perPageOptions={config.perPage?.options} />
				)}
				{/* {config.hidePagination !== true && (
					<Pagination
						rowsPerPageOptions={config.perPage?.options}
						// Empty text that is shown when there is no results, this removes text
						limit={<span></span>}
					/>
				)} */}
			</div>
		</div>
	)
}
