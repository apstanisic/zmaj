import { ModelType } from ".."
import { EntityRefVariants, ModelVariant } from "./entity-ref-variants.type"

export type StripEntityRef<T> = NonNullable<T> extends EntityRefVariants<infer R> ? R : T

export type StripModelType<T> = NonNullable<T> extends ModelVariant<infer R> ? ModelType<R> : T
