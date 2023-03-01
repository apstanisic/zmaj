import { sdkThrow } from "./errors/error-utils"
import { ZmajSdk } from "./sdk"

/**
 * Singleton instance of ZmajSdk
 *
 * You must call initialize only once, before trying to get instance
 *
 * @example
 * ```
 * ZmajSingleton.initialize({ url: 'http://localhost:5000' })
 * const sdk = ZmajSingleton.instance
 * ```
 *
 * Constructor is private and class is abstract to forbid creating instance of factory
 *
 */
export abstract class ZmajSingleton {
	static #instance?: ZmajSdk

	/**
	 * Constructor is disabled
	 */
	private constructor() {
		// There should not be instance of this class
		sdkThrow("Can't create instance")
	}

	static get instance(): ZmajSdk {
		if (!this.#instance) sdkThrow("You must first call `ZmajSingleton.initialize`")

		return this.#instance
	}

	static initialize({ url }: { url: string }): void {
		if (this.#instance) sdkThrow("Already initialized")
		this.#instance = new ZmajSdk({ url, name: "ZMAJ_SINGLETON" })
	}

	static destroy(): void {
		this.#instance = undefined
	}
}
