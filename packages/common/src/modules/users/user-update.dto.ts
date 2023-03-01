import { ZodDto } from "@common/zod/zod-dto"
import { UserCreateSchema } from "./user-create.dto"

export const UserUpdateSchema = UserCreateSchema.omit({ password: true }).partial()

export class UserUpdateDto extends ZodDto(UserUpdateSchema) {}
