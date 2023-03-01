import { sleep } from "./sleep"

/**
 * Ensure that function last at least x ms
 *
 * It is useful when we don't want user to know if function exited early.
 * For sending reset email, we don't want user to know if email exist, so time should always
 * be consistent
 *
 * @param minDurationMs How much
 * @param fn That are we measuring
 */

export async function minFnDuration(minDurationMs: number, fn: () => unknown): Promise<void> {
	const start = Date.now()
	await fn()
	const end = Date.now()
	const duration = end - start
	const remaining = minDurationMs - duration
	if (remaining > 0) {
		await sleep(remaining)
	}
}
