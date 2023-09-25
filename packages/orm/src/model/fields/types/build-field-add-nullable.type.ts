import { Except } from "type-fest"
import { BuildFieldParamsAndType } from "./build-field-params-and-type.type"

/**
 * If field is nullable,
 * we will add null to default type. Plus, we add special _nullable, where we can access
 * if field is nullable as boolean.
 * This should be called before update, read, and create types, since this modifies base `_type`,
 * on top of which other types are built
 */
export type BuildFieldAddNullable<TParams extends BuildFieldParamsAndType<any>> = Except<
	TParams,
	"_type"
> & {
	_type: TParams["nullable"] extends true ? TParams["_type"] | null : TParams["_type"]
	_nullable: TParams["nullable"] extends true ? true : false
}
