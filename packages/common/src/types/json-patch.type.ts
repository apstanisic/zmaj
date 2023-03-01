/**
 * JSON Patch
 *
 * Contain diff between 2 objects
 *
 * Only "replace", "remove" and "add" operations can be generated.
 * Does not produce "move", "copy" and "test" patches.
 */

export type JsonPatch = {
	op: "replace" | "remove" | "add"
	path: string
	value?: unknown
}
