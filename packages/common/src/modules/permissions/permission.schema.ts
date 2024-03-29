import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { PermissionModel } from "./permission.model"

export const PermissionSchema = ModelSchema<PermissionModel>()(
	z.object({
		roleId: z.string().uuid(),
		action: z.string().min(1).max(100),
		resource: z.string().min(1).max(100),
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		conditions: z.record(z.any()).nullable().default(null),
		fields: z.array(z.string()).nullable().default(null),
	}),
)
