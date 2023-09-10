import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"

/**
 * Simply check if this value can be updated, if it can, allow to pass value, otherwise forbid
 */
export type BuildFieldAddUpdate<P extends BuildFieldParamsAndType<any>> = P & {
	_update: P["canUpdate"] extends false ? undefined : P["_type"] | undefined
	// If we pass overrideHidden, we get type without optional
	_updateOverride: P["_type"] | undefined
}
