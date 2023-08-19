import { BaseModel, ModelType } from ".."
import { ModelVariant } from "./entity-ref-variants.type"

export type Fields<T extends ModelType<BaseModel>> = {
	[key in keyof T]?: NonNullable<T[key]> extends ModelVariant<infer R>
		? Fields<ModelType<R>> | true
		: true
}

// export type Fields<T = Record<string, any>> = {
// 	[key in keyof T]?: NonNullable<T[key]> extends EntityRefVariants<infer R>
// 		? Fields<StripEntityRef<R>> | true
// 		: true
// }
