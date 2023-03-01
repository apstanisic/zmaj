import { z } from "zod"
import { SingleFilterSchema } from "./single-filter.schema"

export type SingleFilter = z.infer<typeof SingleFilterSchema>
