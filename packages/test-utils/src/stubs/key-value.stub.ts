import { randChanceBoolean, randSentence, randWord } from "@ngneat/falso"
import { KeyValueSchema, Stub } from "@zmaj-js/common"

/**
 * This provides user stub with raw password
 */
export const KeyValueStub = Stub(KeyValueSchema, () => ({
	key: randWord(),
	value: randSentence(),
	namespace: randChanceBoolean({ chanceTrue: 0.5 }) ? randWord() : null,
}))
