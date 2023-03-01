import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { Role } from "./role.model"

export const RoleSchema = ModelSchema<Role>()(
	z.object({
		name: z.string().min(1).max(40),
		description: z.string().min(0).max(200).nullable().default(null),
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
	}),
)
