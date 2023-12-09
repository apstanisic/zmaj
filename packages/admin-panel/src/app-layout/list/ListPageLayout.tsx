import { useListLayoutConfig } from "@admin-panel/context/layout-config-context"
import { clsx } from "clsx"
import { ListBase, ListControllerProps, useListContext } from "ra-core"
import { ReactNode } from "react"
import { useResourceCollection } from "../../hooks/use-resource-collection"
import { throwInApp } from "../../shared/throwInApp"
import { CurrentlyActiveFilters } from "./CurrentlyActiveFilters"
import { ListActions } from "./ListActions"
import { ListBulkActions } from "./ListBulkActions"
import { ListPagination } from "./ListPagination"
import { ListQuickFilterInput } from "./ListQuickFilterInput"
import { FilterDialog } from "./filter-dialog/FilterDialog"

export type ListPageLayoutProps = {
	/** Children to render */
	children: ReactNode
	/** Current page sidebar */
	sidebar?: ReactNode
	/** Render */
	renderActions?: (props: { defaultActions: ReactNode }) => ReactNode
	renderBulkActions?: (props: { defaultActions: ReactNode }) => ReactNode
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
export function ListPageLayout(props: ListPageLayoutProps) {
	const { children, queryOptions, ...passthrough } = props
	const config = useListLayoutConfig()

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
function ListLayout(props: ListPageLayoutProps) {
	const list = useListContext(props)
	const collection = useResourceCollection() ?? throwInApp("572934")
	const config = useListLayoutConfig()
	const title = props.title ?? collection.label ?? collection.collectionName

	return (
		<div className="flex w-full">
			{props.sidebar}
			<div className="crud-content">
				<div className="my-2 items-center gap-x-2 gap-y-4 sm:flex sm:justify-between">
					{typeof title === "string" ? <h1 className="m-2 text-xl">{title}</h1> : title}
					<ListQuickFilterInput />
				</div>
				<FilterDialog />
				<CurrentlyActiveFilters />
				<div
					className={clsx(
						"flex h-20 w-full items-center ",
						props.hideToolbar && "hidden",
					)}
				>
					{list.selectedIds.length > 0 ? (
						<ListBulkActions render={props.renderBulkActions} />
					) : (
						<ListActions render={props.renderActions} />
					)}
				</div>
				{props.children}

				{!config.hidePagination && (
					<ListPagination perPageOptions={config.perPage?.options} />
				)}
			</div>
		</div>
	)
}
