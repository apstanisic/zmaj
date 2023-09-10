import { BaseModel } from "@orm-engine/model/base-model"
import { ArrayRelationType, RelationType } from "@orm-engine/model/relations/relation-type.types"
import { SelectProperties } from "../select-properties/select-properties.type"
import { ReturnedProperties } from "./returned-properties.type"

export type ReturnedRelationProperties<
	TInnerModel extends BaseModel,
	TInnerFields extends SelectProperties<TInnerModel> | undefined,
	TAddHidden extends boolean,
	TRelationType extends RelationType,
> = TRelationType extends ArrayRelationType
	? SubRelationInner<TInnerModel, TInnerFields, TAddHidden>[]
	: SubRelationInner<TInnerModel, TInnerFields, TAddHidden>

/**
 * This calculates type, main type just assign array if needed
 */
type SubRelationInner<
	TInnerModel extends BaseModel,
	TInnerFields extends SelectProperties<TInnerModel> | undefined,
	TAddHidden extends boolean,
> = TInnerFields extends undefined
	? ReturnedProperties<TInnerModel, undefined, TAddHidden>
	: TInnerFields extends object
	? ReturnedProperties<TInnerModel, TInnerFields, TAddHidden>
	: never
