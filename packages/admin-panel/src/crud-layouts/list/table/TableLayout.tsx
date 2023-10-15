import { DeleteButton } from "@admin-panel/app-layout/buttons/DeleteButton"
import { EditButton } from "@admin-panel/app-layout/buttons/EditButton"
import { ShowButton } from "@admin-panel/app-layout/buttons/ShowButton"
import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { CheckboxInput } from "@admin-panel/ui/forms/Checkbox"
import { Table } from "@admin-panel/ui/Table"
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	OnChangeFn,
	RowSelectionState,
	useReactTable,
} from "@tanstack/react-table"
import { notNil, Struct } from "@zmaj-js/common"
import { clsx } from "clsx"
import { RecordContextProvider, useListContext, useResourceDefinition } from "ra-core"
import { isFunction, objectify, title } from "radash"
import { memo, useCallback, useMemo } from "react"
import { usePropertiesContext } from "../../../context/property-context"
import { RenderProperty } from "../../../generator/properties/RenderProperty"
import { useResourceCollection } from "../../../hooks/use-resource-collection"
import { Property } from "../../../types/Property"

function orderFields(fields: readonly Property[], order?: readonly string[]): readonly Property[] {
	if (!order) return fields
	return order
		.map((item) => fields.find((f) => "field" in f && f.field.fieldName === item))
		.filter(notNil)
}

const helper = createColumnHelper<Struct>()
export const TableLayout = memo(() => {
	const { data, onSelect, selectedIds, ...list } = useListContext()
	const properties = usePropertiesContext()
	const collection = useResourceCollection()
	const resource = useResourceDefinition()
	const config = useLayoutConfigContext().list
	// const redirect = useRedirect()
	// let res =
	const propertiesMap = useMemo(
		() => objectify(properties, (v) => v.property), //
		[properties],
	)

	const columns = useMemo((): ColumnDef<Struct>[] => {
		const order = config.layout?.table?.fields

		const checkbox = helper.display({
			id: "$select",
			header: ({ table }) => (
				<CheckboxInput
					// className="aspect-square"
					aria-label="Select all"
					isSelected={table.getIsAllRowsSelected()}
					// onChange={table.getToggleAllRowsSelectedHandler()}
					onChange={table.toggleAllRowsSelected}
					isIndeterminate={table.getIsSomeRowsSelected()}
				/>
			),
			cell: ({ row }) => (
				<CheckboxInput
					aria-label="Select row"
					// className="aspect-square"
					isSelected={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		})

		const fromData = orderFields(properties, order)
			.map((property) => {
				const toRender =
					property.type === "many-to-one" ||
					property.type === "field" ||
					property.type === "owner-one-to-one" ||
					property.type === "ref-one-to-one"

				if (!toRender) return
				// const field = "field" in property ? property.field : undefined
				// only render fields and m2o
				// if (!field) return

				const label =
					property.type === "field"
						? property.field.label ?? title(property.field.fieldName)
						: property.relation.relation.label ?? title(property.relation.propertyName)

				return helper.accessor(property.property, {
					id: property.property,
					header: label,
					cell: (info) => <RenderProperty property={property} />,

					// footer: (props) => "" as any,
				})
			})
			.filter(notNil)

		const actions = helper.display({
			id: "$actions",
			header: () => <span className="center">Actions</span>,
			cell: () => (
				<div className="center flex">
					{resource.hasShow && <ShowButton onlyIcon />}
					{resource.hasEdit && <EditButton onlyIcon />}
					{config.hideDelete !== true && <DeleteButton onlyIcon />}
				</div>
			),
		})
		// limit to 6 columns
		return [checkbox, ...fromData.slice(0, 6), actions]
	}, [
		config.hideDelete,
		config.layout?.table?.fields,
		properties,
		resource.hasEdit,
		resource.hasShow,
	])

	const rowSelection = useMemo(
		() => Object.fromEntries(selectedIds.map((idVal) => [idVal, true])),
		[selectedIds],
	)

	// this is made for react `useState`, but we need to check type
	// it's providing getter function, but it can in the future provide value
	const onRowSelectionChange = useCallback<OnChangeFn<RowSelectionState>>(
		(updater) => {
			onSelect(
				Object.keys(
					isFunction(updater) ? updater(rowSelection) : updater, //
				),
			)
		},
		[onSelect, rowSelection],
	)
	// if we pass `data ?? []` directly, when data is undefined (server error), it will cause infinite loop
	const values = useMemo(() => data ?? [], [data])

	const table = useReactTable({
		columns: columns,
		data: values,
		getCoreRowModel: getCoreRowModel(),
		enableRowSelection: true,
		state: { rowSelection, columnPinning: { left: ["$select"], right: ["$actions"] } },
		getRowId: (row) => row[collection.pkField],
		onRowSelectionChange,
	})

	return (
		<>
			<Table
				className={clsx(
					" max-h-[80vh] w-full overflow-x-auto whitespace-nowrap dark:text-white",
				)}
			>
				<Table.Head
					allSelected={table.getIsAllRowsSelected()}
					className={clsx(data?.length === 0 && "!border-b-0")}
				>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.HeaderRow key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => (
								<Table.HeaderColumn
									align="left"
									key={header.id}
									className={clsx(
										header.id === "$select" && " sticky left-0 z-20 w-12 ", //
										header.id === "$actions" && " sticky right-0 z-20 w-32", //
									)}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
										  )}
								</Table.HeaderColumn>
							))}
						</Table.HeaderRow>
					))}
				</Table.Head>
				<Table.Body>
					{table.getRowModel().rows.map((row) => (
						<RecordContextProvider value={row.original} key={row.id}>
							<Table.Row
								selected={row.getIsSelected()}
								// hover
								// className={clsx(
								// 	resource.hasShow && "cursor-pointer",
								// 	resource.hasEdit && "cursor-pointer",
								// )}
								// onClick={() => {
								// 	if (selectedIds.length > 0) {
								// 		return list.onToggleItem(row.original["id"])
								// 	}
								// 	const whereTo = resource.hasShow ? "show" : resource.hasEdit ? "edit" : undefined
								// 	if (!whereTo) return
								// 	redirect(whereTo, `/${resource.name}`, row.original["id"])
								// }}
							>
								{row.getVisibleCells().map((cell) => {
									const Component =
										cell.column.id === "$select"
											? Table.HeaderColumn
											: Table.Column
									const prop = propertiesMap[cell.column.id]

									return (
										<Component
											key={cell.id}
											className={clsx(
												"bg-inherit",
												cell.column.id === "$select" &&
													" sticky left-0 z-20 w-12 shadow-inner",
												cell.column.id === "$actions" &&
													"sticky right-0 z-20 shadow-inner ", //
											)}
										>
											{prop ? (
												<RenderProperty property={prop} />
											) : (
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)
											)}
										</Component>
									)
								})}
							</Table.Row>
						</RecordContextProvider>
					))}
				</Table.Body>
				{/* {table.getFooterGroups().length > 0 && (
				<Table.Footer>
					{table.getFooterGroups().map((footerGroup) => (
						<Table.Row key={footerGroup.id}>
							{footerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.footer, header.getContext())}
								</th>
							))}
						</Table.Row>
					))}
				</Table.Footer>
			)} */}
			</Table>
			{values.length === 0 && (
				<p className="mt-12 mb-28 text-center text-2xl font-light">No Items</p>
			)}
		</>
	)
})
