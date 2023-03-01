import { z } from "zod"
import { ForeignKeySchema } from "./foreign-key.schema"

export type ForeignKey = Readonly<z.infer<typeof ForeignKeySchema>>
