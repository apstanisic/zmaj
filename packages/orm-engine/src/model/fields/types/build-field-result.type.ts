import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"
import { BuildFieldParams } from "./build-field-params.type"
import { HandleFieldType } from "./handle-field-type.type"

export type BuildFieldResult<TType, TParams extends BuildFieldParams> = HandleFieldType<
	BuildFieldParamsAndType<TType, TParams>
>
