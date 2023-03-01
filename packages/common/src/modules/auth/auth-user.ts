import { pick } from "radash"
import { ZodDto } from "../../zod/zod-dto"
import { User } from "../users"
import { AuthUserSchema } from "./auth-user.schema"

export class AuthUser extends ZodDto(AuthUserSchema) {
	static fromUser(user: User): AuthUser {
		const { email, roleId, id } = user
		return new AuthUser({ email, roleId, userId: id })
	}

	/**
	 * Needs to be same as inner method, but this returns stripJwtData function
	 */
	static override fromUnknown(data: unknown): AuthUser {
		return new AuthUser(data as never)
	}

	static verify(user: unknown): AuthUser | undefined {
		return user instanceof AuthUser ? user : undefined
	}

	stripJwtData(): Pick<AuthUser, "email" | "userId" | "roleId"> {
		return pick(this, ["email", "userId", "roleId"])
	}

	clone(): AuthUser {
		return new AuthUser({ ...this })
	}
}
