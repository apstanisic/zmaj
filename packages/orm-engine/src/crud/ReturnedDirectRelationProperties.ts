import { BaseModel } from "@orm-engine/model/base-model"
import { DirectRelationModels } from "@orm-engine/model/types/extract-model-relations.type"
import { Combined } from "./returned-fields.type"
import { SelectFields } from "./select-fields.type"

export type ReturnedDirectRelationProperties<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean = false,
> = {
	[key in keyof DirectRelationModels<TModel>]: key extends keyof NonNullable<TFields>
		? NonNullable<TFields>[key] extends true
			? Combined<DirectRelationModels<TModel>[key], undefined, TIncludeHidden>
			: NonNullable<TFields>[key] extends object
			? Combined<DirectRelationModels<TModel>[key], NonNullable<TFields>[key], TIncludeHidden>
			: string
		: DirectRelationModels<TModel>[key] | undefined
}
