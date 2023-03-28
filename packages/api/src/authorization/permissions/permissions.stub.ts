import { rand, randWord } from "@ngneat/falso"
import { Permission, PermissionSchema, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const PermissionStub = stub<Permission>(
	() => ({
		action: rand(["read", "update", "delete", "create"]),
		resource: randWord(),
		roleId: v4(),
		conditions: {},
		createdAt: new Date(),
		fields: null,
		id: v4(),
	}),
	PermissionSchema,
)
