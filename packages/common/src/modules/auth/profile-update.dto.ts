import { ZodDto } from "@common/zod"
import { UserUpdateSchema } from "../users"

const schema = UserUpdateSchema.pick({ firstName: true, lastName: true })

export class ProfileUpdateDto extends ZodDto(schema) {}
