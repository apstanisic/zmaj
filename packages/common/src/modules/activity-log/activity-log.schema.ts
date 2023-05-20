import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { AuthUserSchema } from "../auth/auth-user.schema"
import { ActivityLog } from "./activity-log.model"

export const ActivityLogSchema = ModelSchema<ActivityLog>()(
	z.object({
		action: z.string().min(1).max(200),
		resource: z.string().min(1).max(200),
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		comment: z.string().max(100).nullable().default(null),
		userId: z.string().uuid().nullable().default(null),
		userAgent: z.string().max(200).nullable().default(null),
		changes: z.array(z.any()).nullable().default(null),
		additionalInfo: z.record(z.any()).nullable().default(null),
		previousData: z.record(z.any()).nullable().default(null),
		ip: z.string(), //.refine((v) => isIP(v) !== 0, { message: "Invalid IP" }), // todo
		itemId: z.string().min(1).max(60).nullish().default(null), //todo
		embeddedUserInfo: AuthUserSchema.pick({ userId: true, roleId: true, email: true })
			.nullish()
			.default(null),
	}),
)
