import { ZodDto } from "@common/zod"
import { PermissionCreateSchema } from "./permission-create.dto"

export const PermissionUpdateSchema = PermissionCreateSchema.pick({
	conditions: true,
	fields: true,
}).partial()

export class PermissionUpdateDto extends ZodDto(PermissionUpdateSchema) {}
