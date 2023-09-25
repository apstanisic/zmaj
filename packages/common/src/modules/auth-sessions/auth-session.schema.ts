import { addMonths } from "date-fns"
// import { isIP } from "net"
import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod"
import { v4 } from "uuid"
import { z } from "zod"
import { AuthSessionModel } from "./auth-session.model"

export const AuthSessionSchema = ModelSchema<AuthSessionModel>()(
	z.object({
		id: z.string().uuid().default(v4),
		createdAt: z.date().default(now),
		ip: z.string(), //.refine((ip) => isIP(ip) !== 0, { message: "Invalid IP" }),
		userId: z.string().uuid(),
		refreshToken: z.string().min(10).max(200),
		userAgent: z.string().min(1).max(200).nullable().default(null),
		validUntil: z.date().default(() => addMonths(new Date(), 3)),
		lastUsed: z.date().default(now),
	}),
)
