import { describe, expect, it, vi } from "vitest"
import { MemoryCache } from "./memory-cache"
import { sleep } from "./sleep"

describe.concurrent("MemoryCache", () => {
	it("should remove cache after it is expired", async () => {
		const cache = new MemoryCache(1000)
		cache.set(55)
		await sleep(990)
		const val1 = cache.get()
		expect(val1).toEqual(55)
		await sleep(20)
		const val2 = cache.get()
		expect(val2).toEqual(undefined)
	})

	it("should call callback when cache expired", async () => {
		const onExpire = vi.fn()
		const cache = new MemoryCache(1000)
		cache.onExpireFn = onExpire
		cache.set(55)
		expect(onExpire).toBeCalledTimes(0)
		await sleep(780)
		expect(onExpire).toBeCalledTimes(0)
		await sleep(40)
		expect(onExpire).toBeCalledTimes(1)
	})

	it("should reset expiration when value is changed", async () => {
		const cache = new MemoryCache(1000)
		cache.set(55)
		await sleep(600)
		cache.set(10)
		await sleep(600)
		expect(cache.get()).toEqual(10)
	})

	it("should remove timeout when value is removed", async () => {
		const onExpire = vi.fn()
		const cache = new MemoryCache(1000)
		cache.onExpireFn = onExpire
		cache.set(55)
		cache.remove()
		await sleep(1100)
		expect(onExpire).not.toBeCalled()
	})
})
