import { ColumnType } from "../db-column-type"
import { CreateFieldParams } from "./create-field-params.type"

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
export type CreateFieldParamsAndType<
	TType,
	TCreateFieldParams extends CreateFieldParams = CreateFieldParams,
> = TCreateFieldParams & {
	dataType: ColumnType
	_type: TType
}
