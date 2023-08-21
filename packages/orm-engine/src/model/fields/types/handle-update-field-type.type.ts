import { CreateFieldParamsAndType } from "./create-field-params-and-type.type"

/**
 * Simply check if this value can be updated, if it can, allow to pass value, otherwise forbid
 */
export type HandleUpdateFieldType<P extends CreateFieldParamsAndType<any>> = P & {
	_update: P["canUpdate"] extends false ? undefined : P["_type"] | undefined
	_updateOverride: P["_type"] | undefined
}
