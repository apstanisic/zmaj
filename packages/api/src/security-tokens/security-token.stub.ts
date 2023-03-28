import { randBetweenDate, randPastDate, randWord } from "@ngneat/falso"
import { SecurityToken, SecurityTokenSchema, Stub, stub } from "@zmaj-js/common"
import { addMinutes, subMinutes } from "date-fns"
import { v4 } from "uuid"

export const SecurityTokenStub = stub<SecurityToken>(
	() => ({
		createdAt: randPastDate({ years: 4 }),
		usedFor: randWord(),
		data: null,
		validUntil: randBetweenDate({
			from: subMinutes(new Date(), 200),
			to: addMinutes(new Date(), 200),
		}),
		userId: v4(),
		token: v4(),
		id: v4(),
	}),
	SecurityTokenSchema,
)
