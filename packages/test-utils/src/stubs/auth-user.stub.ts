import { AuthUser, stub } from "@zmaj-js/common"
import { addMinutes, getUnixTime } from "date-fns"
import { random } from "radash"
import { v4 } from "uuid"

export const AuthUserStub = stub<AuthUser>(
	() =>
		new AuthUser({
			roleId: v4(),
			userId: v4(),
			email: `test_${random(1000, 9999)}@example.test`,
			sub: "Zmaj",
			iat: getUnixTime(new Date()),
			exp: getUnixTime(addMinutes(new Date(), 5)),
		}),
)
