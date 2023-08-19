import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"

export type HandleReadFieldType<TParams extends CreateFieldParamsAndType<any>> = TParams & {
	_read: TParams["canRead"] extends false ? TParams["_type"] | undefined : TParams["_type"]
}
