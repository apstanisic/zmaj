import { OnlyFields } from "./only-fields.type"

/**
 * See in future how to improve so that required fields are provided.
 * I can't do this now, since non nullable fields could have default value, and I
 * currently can check for that
 */
export type CreateDto<T> = Partial<OnlyFields<T>>
