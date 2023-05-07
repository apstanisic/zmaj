import { EntityRefVariants } from "./entity-ref-variants.type"

export type StripEntityRefKeepArray<T> = NonNullable<T> extends EntityRefVariants<infer R>
	? NonNullable<T> extends any[]
		? R[]
		: R
	: T
