import { z } from "zod"
import { UniqueKeySchema } from "./unique-key.schema"

export type UniqueKey = Readonly<z.infer<typeof UniqueKeySchema>>
