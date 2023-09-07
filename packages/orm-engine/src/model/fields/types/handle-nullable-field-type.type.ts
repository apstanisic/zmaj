import { Except } from "type-fest"
import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"

/**
 * This should be called before update, read, and create types
 */
export type HandleNullableFieldType<TParams extends CreateFieldParamsAndType<any>> = Except<
	TParams,
	"_type"
> & {
	_type: TParams["nullable"] extends true ? TParams["_type"] | null : TParams["_type"]
}
