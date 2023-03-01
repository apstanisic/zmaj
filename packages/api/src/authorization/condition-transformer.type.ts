import { AuthUser } from "@zmaj-js/common"

export type AuthzConditionTransformer<T = unknown> = {
	/**
	 * Key for which this hook is register
	 *
	 * Without leading "$"
	 */
	key: string
	/**
	 * Function that transforms condition
	 *
	 * Accepts just user for now, but it's trivial to expand in the future
	 * `modifier` is part of the key after ":" ('$CURRENT_DATE:3h' => modifier is '3h').
	 * It will always be string because it's part of the string.
	 */
	transform: (params: { user?: AuthUser; modifier?: string }) => T
}
