import { randBoolean, randColor, randPastDate, randPhrase } from "@ngneat/falso"
import { Role, RoleSchema, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const RoleStub = stub<Role>(
	() => ({
		name: randColor(),
		description: randPhrase(),
		createdAt: randPastDate(),
		id: v4(),
		requireMfa: randBoolean(),
	}),
	RoleSchema,
)
