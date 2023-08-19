import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"
import { CreateFieldParams } from "./create-field-params.type"
import { HandleFieldType } from "./handle-field-type.type"

export type CreateFieldResult<TType, TParams extends CreateFieldParams> = HandleFieldType<
	CreateFieldParamsAndType<TType, TParams>
>
