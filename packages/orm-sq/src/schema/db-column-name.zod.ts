import { z } from "zod"

/**
 * Valid DB column name (little stricter then var). Only letters, numbers and underscores
 */
export const columnNameRegex = /^([A-Za-z])((_)?([A-Za-z0-9]))*$/

export const DbColumnNameSchema = z.string().regex(columnNameRegex).min(2).max(100)
