import { Except } from "type-fest"
import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"

/**
 * This should be called before update, read, and create types
 */
export type HandleNullableFieldType<P extends CreateFieldParamsAndType<any>> = Except<
	P,
	"_type"
> & {
	_type: P["nullable"] extends true ? P["_type"] | null : P["_type"]
}
