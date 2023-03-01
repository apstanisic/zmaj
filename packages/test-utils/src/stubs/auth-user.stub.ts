import { AuthUser, AuthUserSchema, Stub } from "@zmaj-js/common"
import { random } from "radash"
import { v4 } from "uuid"

export const AuthUserStub = Stub(
	AuthUserSchema.transform((v) => new AuthUser(v)),
	() => ({
		roleId: v4(),
		userId: v4(),
		email: `test_${random(1000, 9999)}@example.test`,
	}),
)
