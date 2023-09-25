import { Opaque } from "type-fest"

/**
 * Used to require casting as UUID
 */
export type UUID = Opaque<string, "UUID">

// this would complicate comparison
// since we can't overwrite ===
// class UUID {
// 	constructor(readonly value: string) {}
// 	toJSON(): string {
// 		return this.value
// 	}

// 	toString(): string {
// 		return this.value
// 	}

// 	static random(): UUID {
// 		return new UUID(v4())
// 	}
// }
