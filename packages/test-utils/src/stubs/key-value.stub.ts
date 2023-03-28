import {
	randBetweenDate,
	randChanceBoolean,
	randPastDate,
	randSentence,
	randWord,
} from "@ngneat/falso"
import { KeyValue, KeyValueSchema, now, stub } from "@zmaj-js/common"
import { v4 } from "uuid"

/**
 * This provides user stub with raw password
 */
export const KeyValueStub = stub<KeyValue>(() => {
	const createdAt = randPastDate()
	return {
		createdAt,
		updatedAt: randBetweenDate({ from: createdAt, to: now() }),
		id: v4(),
		key: randWord(),
		value: randSentence(),
		namespace: randChanceBoolean({ chanceTrue: 0.5 }) ? randWord() : null,
	}
}, KeyValueSchema)
