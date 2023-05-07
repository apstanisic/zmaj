import { ConditionalExcept } from "type-fest"
import { EntityRefVariants } from "./entity-ref-variants.type"

export type OnlyFields<T> = ConditionalExcept<Required<T>, EntityRefVariants<unknown>>
