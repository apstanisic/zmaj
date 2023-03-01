import { Mock } from "vitest"

export function asMock(val: any): Mock {
	return val as Mock
}
