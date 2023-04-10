import { Struct } from "@zmaj-js/common"
import { EntityRefVariants } from "./entity-ref-variants.type"
import { StripEntityRef } from "./strip-entity-ref.type"

export type Fields<T = Struct<any>> = {
	[key in keyof T]?: NonNullable<T[key]> extends EntityRefVariants<infer R>
		? Fields<StripEntityRef<R>> | true
		: true
}
