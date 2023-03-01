import {
	randFutureDate,
	randIp,
	randPassword,
	randRecentDate,
	randUserAgent,
	randUuid,
} from "@ngneat/falso"
import { AuthSessionSchema, Stub } from "@zmaj-js/common"

export const AuthSessionStub = Stub(AuthSessionSchema, () => ({
	ip: randIp(),
	userId: randUuid(),
	refreshToken: randPassword(),
	validUntil: randFutureDate(),
	lastUsed: randRecentDate(),
	userAgent: randUserAgent(),
}))
