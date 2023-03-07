import { randColor, randPastDate, randPhrase } from "@ngneat/falso"
import { RoleSchema, Stub } from "@zmaj-js/common"

export const RoleStub = Stub(RoleSchema, () => ({
	name: randColor(),
	description: randPhrase(),
	createdAt: randPastDate(),
}))
