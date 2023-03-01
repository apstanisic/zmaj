import { throw500 } from "@api/common/throw-http"
import { intRegex } from "@zmaj-js/common"
import { fromUnixTime } from "date-fns"
import { AuthzConditionTransformer } from "../condition-transformer.type"

/**
 * Convert string date to date object so it can be compared
 * Support ISO date, and unix timestamp (seconds)
 *
 * From '$DATE:2022-09-12T16:12:53.343Z' to new Date(...)
 * From '$DATE:1662999203' to new Date(...)
 */
export const dateTransformer: AuthzConditionTransformer = {
	key: "DATE",
	transform: (params) => {
		const date = params.modifier ?? throw500(69896)
		if (intRegex.test(date)) {
			return fromUnixTime(parseInt(date, 10))
		} else {
			return new Date(date)
		}
	},
}
