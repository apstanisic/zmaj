import { z } from "zod"
import { DbColumnSchema } from "./db-column.schema"

export type DbColumn = Readonly<z.infer<typeof DbColumnSchema>>
