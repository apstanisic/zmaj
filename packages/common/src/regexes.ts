/**
 * Number regex (both int and float)
 */
export const numberRegex = /^(-?)(\d+)((.?)(\d+))?$/
/**
 * Int regex
 */
export const intRegex = /^(-?)(\d+)$/

/**
 * Time regex (with optional seconds)
 */
export const timeRegex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)(:(?:[0-5]\d))?$/
/**
 * Valid DB column name (little stricter then var). Only letters, numbers and underscores
 */
export const columnNameRegex = /^([A-Za-z])((_)?([A-Za-z0-9]))*$/

/**
 * UUID Regex
 */
export const uuidRegex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * JWT regex
 */
export const jwtRegex = /^([\w-])+\.([\w-])+\.([\w-])+$/

/**
 * Regex that ensures that value is serialized js date
 *
 * We are checking if value is valid JS date, not valid ISO 8601 date, since we only use
 * this for API that uses JavaScript `date.toJSON` to serialize data
 *
 */
export const jsonDateRegex =
	/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z$/

export const migrationNameRegex = /^2[0-9]{3}_[0-9]{2}_[0-9]{2}_[0-9]{2}_[0-9]{2}_[0-9]{2}__\w+$/
// relaxed a little bit
// export const migrationNameRegex =
// 	/^2[0-9]{3}_[0-9]{2}_[0-9]{2}_[0-9]{2}_[0-9]{2}_[0-9]{2}__[A-z]{1}[\w-]+[A-Za-z]{1}$/

/**
 * Valid files extension, if not null. Allow letters and numbers (3gp, 7z).
 * Only lowercase, if provided as uppercase, first transform them
 *
 * Some have dashed
 * sfd-hdstx
 *
 * Also, it looks like underscore is allowed
 * @see https://stackoverflow.com/questions/4814040/allowed-characters-in-filename#comment38006480_4814088
 *
 *
 * With starting dot
 *
 */
export const fileExtensionRegex = /^\.([a-z0-9-_]){1,20}$/
