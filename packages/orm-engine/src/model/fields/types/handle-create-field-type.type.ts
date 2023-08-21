import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"

/**
 * Extract type for create params
 */
export type HandleCreateFieldType<TCreateParams extends CreateFieldParamsAndType<any>> =
	TCreateParams & {
		_create: TCreateParams["canCreate"] extends false ? undefined : GetType<TCreateParams>
		_createOverride: GetType<TCreateParams>
	}

type GetType<TCreateParams extends CreateFieldParamsAndType<any>> =
	TCreateParams["hasDefault"] extends true // if has default value, it will allow null | undefined
		? TCreateParams["_type"] | undefined | null
		: TCreateParams["isPk"] extends true // if it's pk, we assume it has default (plus we provide auto create UUID)
		? TCreateParams["_type"] | undefined | null
		: TCreateParams["nullable"] extends true // if nullable, not required
		? TCreateParams["_type"] | undefined | null
		: TCreateParams["_type"] // otherwise, value must be provided
