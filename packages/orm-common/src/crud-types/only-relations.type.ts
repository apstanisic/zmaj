import { ConditionalPick } from "type-fest"
import { EntityRefVariants } from "./entity-ref-variants.type"

export type OnlyRelations<T> = ConditionalPick<Required<T>, EntityRefVariants<unknown>>
