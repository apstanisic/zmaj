import { z } from "zod"
import { CompositeUniqueKeySchema } from "./composite-unique-key.schema"

export type CompositeUniqueKey = Readonly<z.infer<typeof CompositeUniqueKeySchema>>
