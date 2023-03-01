import { z } from "zod"
import { LayoutConfigSchema } from "./layout-config.schema"

export type LayoutConfig = z.infer<typeof LayoutConfigSchema>
