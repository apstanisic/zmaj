import { EntityRefVariants } from "./entity-ref-variants.type"

export type StripEntityRef<T> = NonNullable<T> extends EntityRefVariants<infer R> ? R : T
