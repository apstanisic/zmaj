import { ZodDto } from "@common/zod/zod-dto"
import { RoleCreateSchema } from "./role-create.dto"

export const RoleUpdateSchema = RoleCreateSchema.partial()

export class RoleUpdateDto extends ZodDto(RoleUpdateSchema) {}
