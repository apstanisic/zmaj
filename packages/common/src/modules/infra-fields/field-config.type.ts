import { z } from "zod"
import { FieldConfigSchema } from "./field-config.schema"

export type FieldConfig = z.infer<typeof FieldConfigSchema>
