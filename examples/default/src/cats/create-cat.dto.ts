import { ZodDto } from "zmaj"
import { z } from "zod"

const schema = z.object({
	name: z.string(),
})

export class CreateCatDto extends ZodDto(schema) {}
