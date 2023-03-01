// import {
// 	DataGrid as MuiDataGrid,
// 	GridCallbackDetails,
// 	GridColumns,
// 	GridRowParams,
// 	MuiEvent,
// } from "@mui/x-data-grid"
// import { IdType, Struct } from "@zmaj-js/common"
// import { difference, min, startCase, uniq } from "lodash-es"
// import { useCallback } from "react"
// import { useListContext, useRedirect, useResourceContext } from "ra-core"

// type DataGridProps = {
// 	handleClick?: (id: IdType, row: Struct) => unknown
// 	disableMultiSelect?: boolean
// 	columns: GridColumns
// }

// export function DataGrid(props: DataGridProps): JSX.Element {
// 	const { columns, disableMultiSelect, handleClick } = props
// 	const resource = useResourceContext()
// 	const redirect = useRedirect()
// 	const list = useListContext()

// 	const configureColumns = useCallback((columns: GridColumns): GridColumns => {
// 		return columns.map((col) => ({
// 			cellClassName: "cursor-pointer",
// 			filterable: false,
// 			type: "string",
// 			editable: false,
// 			width: 220,
// 			headerName: title(col.field),
// 			sortable: false,
// 			hide: false,
// 			filterOperators: [],
// 			renderCell: (c) => (
// 				// no wrap, so it truncate value
// 				<p className="whitespace-nowrap text-sm">{c.value}</p>
// 			),
// 			...col,
// 		}))
// 	}, [])

// 	const onRowClick = useCallback(
// 		(params: GridRowParams, _event: MuiEvent, _details: GridCallbackDetails) => {
// 			if (handleClick) {
// 				return handleClick(params.row["id"], params.row)
// 			} else {
// 				redirect("show", `/${resource}`, params.row["id"])
// 			}
// 		},
// 		[handleClick, redirect, resource],
// 	)

// 	return (
// 		<div>
// 			<MuiDataGrid
// 				sx={{
// 					"& .MuiDataGrid-cell:focus": {
// 						outline: "none",
// 					},
// 					"& .MuiDataGrid-columnHeader:focus": {
// 						outline: "none",
// 					},
// 				}}
// 				disableSelectionOnClick
// 				disableColumnFilter
// 				// disableVirtualization
// 				disableColumnMenu
// 				columns={configureColumns(columns)}
// 				rows={list.data ?? []}
// 				getRowId={(row) => row.id}
// 				autoHeight
// 				onPageChange={(index) => {
// 					list.setPage(index + 1)
// 				}}
// 				checkboxSelection={disableMultiSelect !== true}
// 				onRowClick={onRowClick}
// 				selectionModel={list.selectedIds ?? []}
// 				paginationMode="server"
// 				rowCount={list.total ?? 100_000}
// 				// prevent opening row when clicking on checkbox
// 				onColumnHeaderClick={(params) => {
// 					if (params.field !== "__check__") return
// 					const currentPageIds: IdType[] = list.data.map((row) => row.id)
// 					const allSelected = currentPageIds.every((id) => list.selectedIds.includes(id))
// 					if (allSelected) {
// 						// if all are selected on this page, now is time to remove them
// 						// we want all selected ids, except ones on this page
// 						list.onSelect(difference(list.selectedIds, currentPageIds))
// 					} else {
// 						// if not all are selected, select them all
// 						list.onSelect(uniq([...list.selectedIds, ...currentPageIds]))
// 					}
// 				}}
// 				onCellClick={(params, event) => {
// 					if (params.field === "__check__") {
// 						list.onToggleItem(params.id)
// 						event.stopPropagation()
// 					}
// 				}}
// 				density="standard"
// 				// it throws an error if there are more then 100 items
// 				pageSize={min([list.perPage, 100])}
// 				hideFooterPagination
// 				hideFooter
// 				// pageSize={list.perPage}
// 				// onPageChange={(page) => list.setPage(page)}
// 				// onPageSizeChange={(perPage) => list.setPerPage(perPage)}
// 				// page={list.page - 1}
// 			/>
// 		</div>
// 	)
// }

export default {}
