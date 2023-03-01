const unique = Symbol("entityRef")

/**
 * We use tag for the same reason as Opaque type
 */
export type EntityRef<T> = T & typeof unique
