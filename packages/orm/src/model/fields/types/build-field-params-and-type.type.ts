import { ColumnDataType } from "../column-data-type"
import { BuildFieldParams } from "./build-field-params.type"

/**
 * This is all params that user passed when creating field, plus type that is extracted
 * from method name
 * db.text({ nullable: true }) =>
 * {...params } + dataType: "text", _type: string
 *
 * db.number({}) =>
 * {...params } + dataType: "text", _type: number
 *
 */
export type BuildFieldParamsAndType<
	TType,
	TCreateFieldParams extends BuildFieldParams = BuildFieldParams,
> = TCreateFieldParams & {
	dataType: ColumnDataType
	_type: TType
}
