import { Opaque } from "type-fest"

/**
 * Require casting as Email
 * If function requires email, that means that it will not check if email is valid
 * IDK if I need this, if there is any benefit
 */
export type Email = Opaque<string, "email">
