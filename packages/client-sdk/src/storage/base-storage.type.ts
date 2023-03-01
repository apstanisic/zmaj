export type BaseStorage = {
	getItem(key: string): string | null
	setItem(key: string, val: string): void
	removeItem(key: string): void
}
