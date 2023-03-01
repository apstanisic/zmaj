import { addMilliseconds, isBefore } from "date-fns"

/**
 * Stores only primitive value, no classes, value must be compatible with `structuredClone`
 */
export class MemoryCache<T> {
	private value?: T

	constructor(
		private defaultDuration = 60_000,
		public onExpireFn?: () => Promise<T> | T, //
	) {}

	private validUntil: Date = new Date()

	private timeoutRef?: ReturnType<typeof setTimeout>

	get(): T | undefined {
		if (isBefore(this.validUntil, new Date())) {
			this.value = undefined
			return
		}
		return this.value
	}

	set(val: T): void {
		clearTimeout(this.timeoutRef)

		const ms = this.defaultDuration
		this.validUntil = addMilliseconds(new Date(), ms)
		// this prevent weird stuff happening with this value
		this.value = structuredClone(val)

		const beforeEnd = ms > 10_000 ? 2_000 : ms * 0.8
		this.timeoutRef = setTimeout(async () => {
			if (!this.onExpireFn) return
			this.value = await this.onExpireFn()
			this.validUntil = addMilliseconds(new Date(), ms)
		}, beforeEnd)
	}

	remove(): void {
		this.value = undefined
		clearTimeout(this.timeoutRef)
	}
}
