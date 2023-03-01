import { Opaque } from "type-fest"

/**
 * Used to require casting as UUID
 */
export type UUID = Opaque<string, "UUID">
