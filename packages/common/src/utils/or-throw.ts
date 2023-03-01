export function orThrow<T>(val: T, error?: Error | string): T extends null | undefined ? never : T {
	const err = error instanceof Error ? error : new Error(error)
	if (val === null || val === undefined) throw err
	return val as any
}
