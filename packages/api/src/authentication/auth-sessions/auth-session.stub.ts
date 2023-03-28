import {
	randFutureDate,
	randIp,
	randPassword,
	randRecentDate,
	randUserAgent,
	randUuid,
} from "@ngneat/falso"
import { AuthSession, AuthSessionSchema, now, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

export const AuthSessionStub = stub<AuthSession>(
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
