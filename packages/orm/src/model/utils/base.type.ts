import { Simplify } from "type-fest"
import { ToOptional } from "./to-optional.type"

/**
 * This is base type that should be used most of the time,
 * it simplifies type that is displayed in IDE and converts `T | undefined` to `?: T | undefined`
 */
export type Base<T> = Simplify<ToOptional<T>>
