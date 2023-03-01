import {
	rand,
	randBoolean,
	randEmail,
	randFirstName,
	randLastName,
	randPastDate,
} from "@ngneat/falso"
import { ADMIN_ROLE_ID, PUBLIC_ROLE_ID, Stub, UserSchema } from "@zmaj-js/common"

/**
 * This provides user stub with raw password
 */
export const UserStub = Stub(UserSchema, () => ({
	email: randEmail({ suffix: "test" }),
	firstName: randFirstName(),
	lastName: randLastName(),
	status: rand(["active", "banned", "hacked", "disabled"]) as never,
	roleId: rand([PUBLIC_ROLE_ID, ADMIN_ROLE_ID]),
	confirmedEmail: randBoolean(),
	createdAt: randPastDate({ years: 4 }),
	password: "password",
}))
