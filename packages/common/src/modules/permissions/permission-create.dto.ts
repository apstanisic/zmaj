import { ZodDto } from "@common/zod"
import { PermissionSchema } from "./permission.schema"

export const PermissionCreateSchema = PermissionSchema.pick({
	action: true,
	conditions: true,
	fields: true,
	resource: true,
	roleId: true,
})

export class PermissionCreateDto extends ZodDto(PermissionCreateSchema) {}
