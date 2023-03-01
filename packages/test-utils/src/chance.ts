import { randChanceBoolean } from "@ngneat/falso"
import { isFunction } from "radash"

export function chance<T, U>(chance: number, ok: T | (() => T), notOk: U | (() => U)): T | U {
	const isTrue = randChanceBoolean({ chanceTrue: chance })
	return isTrue ? (isFunction(ok) ? ok() : ok) : isFunction(notOk) ? notOk() : notOk
}
