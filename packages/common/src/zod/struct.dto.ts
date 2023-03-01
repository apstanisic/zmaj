import { z } from "zod"
import { ZodDto } from "./zod-dto"

/**
 * When using DtoBody we need to provide Dto. This will fullfil any object type
 */
export class StructDto extends ZodDto(z.record(z.unknown())) {}
