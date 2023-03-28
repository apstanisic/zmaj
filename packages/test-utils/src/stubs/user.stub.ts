import {
	rand,
	randAlphaNumeric,
	randBoolean,
	randEmail,
	randFirstName,
	randLastName,
	randPastDate,
} from "@ngneat/falso"
import { ADMIN_ROLE_ID, PUBLIC_ROLE_ID, UserWithSecret, stub } from "@zmaj-js/common"
import { v4 } from "uuid"
import { chance } from "../chance.js"

/**
 * This provides user stub with raw password
 */

export const UserStub = stub<UserWithSecret>(() => ({
	id: v4(),
	email: randEmail({ suffix: "test" }),
	firstName: randFirstName(),
	lastName: randLastName(),
	status: rand(["active", "banned", "hacked", "disabled"]) as never,
	roleId: rand([PUBLIC_ROLE_ID, ADMIN_ROLE_ID]),
	confirmedEmail: randBoolean(),
	createdAt: randPastDate({ years: 4 }),
	password: "plain_password",
	otpToken: chance(0.2, () => randAlphaNumeric({ length: 40 }).join(""), null),
}))
