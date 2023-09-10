import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"

/**
 * Simply check if this value can be read, if it can, do not make it optional, make it optional
 */
export type HandleReadFieldType<TParams extends BuildFieldParamsAndType<any>> = TParams & {
	_read: TParams["canRead"] extends false ? TParams["_type"] | undefined : TParams["_type"]
	// If we pass overrideHidden, we get type without optional
	_readOverride: TParams["_type"]
}
