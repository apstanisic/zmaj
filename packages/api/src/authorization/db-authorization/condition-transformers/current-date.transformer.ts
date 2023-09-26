import { throw500 } from "@api/common/throw-http"
import { addMilliseconds } from "date-fns"
import ms from "ms"
import { isInt } from "radash"
import { AuthzConditionTransformer } from "./condition-transformer.type"

export const currentDateTransformer: AuthzConditionTransformer<Date> = {
	key: "CURRENT_DATE",
	transform: ({ modifier }) => {
		if (modifier === undefined) return new Date()
		// It can return NaN or undefined when not valid, so we check all cases
		// It only throws when value is not string, and ours is always string
		// https://github.com/vercel/ms/issues/123
		const inMs = ms(modifier)
		// Rule is not properly configured (it's admins fault, not users)
		if (!isInt(inMs)) throw500(2124)
		return addMilliseconds(new Date(), inMs)
	},
}
