import { rand, randWord } from "@ngneat/falso"
import { PermissionSchema, Stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const PermissionStub = Stub(PermissionSchema, () => ({
	action: rand(["read", "update", "delete", "create"]),
	resource: randWord(),
	roleId: v4(),
	conditions: {},
}))
