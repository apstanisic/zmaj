import { now } from "@common/utils/now"
import { ModelSchema } from "@common/zod/model-schema"
import { ZodPassword } from "@common/zod/zod-utils"
import { v4 } from "uuid"
import { z } from "zod"
import { PUBLIC_ROLE_ID } from "../roles/role.consts"
import { User } from "./user.model"

export const UserSchema = ModelSchema<User>()(
	z.object({
		confirmedEmail: z.boolean().default(false),
		createdAt: z.date().default(now),
		email: z.string().email(),
		firstName: z.string().max(200).nullable().default(null),
		lastName: z.string().max(200).nullable().default(null),
		// passwordExpiresAt: z.date().nullable().default(null),
		password: ZodPassword().default(v4),
		otpToken: z.string().min(8).max(250).nullable().default(null),
		// photoUrl: z.string().url().nullable().default(null),
		roleId: z.string().uuid().default(PUBLIC_ROLE_ID),
		status: z
			.enum(["active", "banned", "hacked", "disabled", "emailUnconfirmed", "invited"])
			.default("active"),
		id: z.string().uuid().default(v4),
	}),
)

/**
 * User schema from db (expect password to be hashed)
 */
export const DbUserSchema = ModelSchema<User>()(UserSchema.extend({ password: z.string() }))
