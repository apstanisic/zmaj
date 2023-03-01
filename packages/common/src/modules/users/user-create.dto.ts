import { isNil } from "@common/utils/lodash"
import { ZodPassword } from "@common/zod"
import { ZodDto } from "@common/zod/zod-dto"
import { z } from "zod"
import { PUBLIC_ROLE_ID } from "../roles"
import { UserSchema } from "./user.schema"

export const UserCreateSchema = UserSchema.pick({
	firstName: true,
	lastName: true,
	email: true,
	status: true,
	// roleId: true,
	confirmedEmail: true,
}).extend({
	// make password without default value
	password: ZodPassword()
		.nullish()
		.transform((v) => (v === null ? undefined : v)),
	roleId: z
		.string()
		.uuid()
		.nullish()
		.transform((v) => (isNil(v) ? PUBLIC_ROLE_ID : v)),
})

export class UserCreateDto extends ZodDto(UserCreateSchema) {}
