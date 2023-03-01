// import { GridColumns, GridNativeColTypes } from "@mui/x-data-grid"
// import { ColumnDataType, isIn, notNil } from "@zmaj-js/common"
// import { RecordContextProvider } from "ra-core"
// import { RenderProperty } from "../../../generator/properties/RenderProperty"
// import { Property } from "../../../types/Property"

// function toDataGridType(col: ColumnDataType): GridNativeColTypes {
// 	if (col === "boolean") return "boolean"
// 	if (col === "date") return "date"
// 	if (col === "datetime") return "dateTime"
// 	if (isIn<ColumnDataType>(col, ["int", "float"])) return "number"
// 	if (isIn<ColumnDataType>(col, ["time", "long-text", "uuid", "short-text"])) return "string"
// 	// fallback to string
// 	return "string"
// }

// export const convertToDataGrid = (properties: readonly Property[]): GridColumns => {
// 	return properties
// 		.map((property): GridColumns[number] | undefined => {
// 			const field = "field" in property ? property.field : undefined
// 			// only render fields and m2o
// 			if (!field) return
// 			const label =
// 				property.type === "field"
// 					? property.field.label ?? property.field.fieldName
// 					: property.relation.label ?? property.relation.propertyName

// 			return {
// 				field: field.fieldName,
// 				headerName: label,
// 				hide: field.canRead === false,
// 				description: field.description ?? undefined,
// 				type: toDataGridType(field.dataType ?? "short-text"),
// 				renderCell: (column) => (
// 					<RecordContextProvider value={column.row}>
// 						<RenderProperty property={property} />
// 					</RecordContextProvider>
// 				),
// 			}
// 		})
// 		.filter(notNil)
// }

export default {}
