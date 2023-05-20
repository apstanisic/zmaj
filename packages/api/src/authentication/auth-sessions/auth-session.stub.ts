import {
	randFutureDate,
	randIp,
	randPassword,
	randRecentDate,
	randUserAgent,
	randUuid,
} from "@ngneat/falso"
import { AuthSession, AuthSessionSchema, StubType, now, stub } from "@zmaj-js/common"
import { SetRequired } from "type-fest"
import { v4 } from "uuid"

export const AuthSessionStub: StubType<SetRequired<AuthSession, "refreshToken">> = stub<
	SetRequired<AuthSession, "refreshToken">
>(
	() => ({
		createdAt: now(),
		id: v4(),
		ip: randIp(),
		userId: randUuid(),
		refreshToken: randPassword(),
		validUntil: randFutureDate(),
		lastUsed: randRecentDate(),
		userAgent: randUserAgent(),
	}),
	AuthSessionSchema,
)
