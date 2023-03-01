import { z } from "zod"
import { ToManyChangeSchema } from "./to-many-change.schema"

export type ToManyChange = z.infer<typeof ToManyChangeSchema>
