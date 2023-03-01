import { sdkThrow } from "@client-sdk/errors/error-utils"
import { SdkState } from "@client-sdk/sdk-state"
import { isNil, sleep } from "@zmaj-js/common"
import axios, { AxiosError, AxiosHeaders, AxiosInstance } from "axios"
import { isFuture, secondsToMilliseconds, subSeconds } from "date-fns"
import EventEmitter from "eventemitter3"
import { AuthEventFn } from "./auth.client"

/**
 * Auth
 * Use localStorage as it's a lot easier to fetch access token sync in React component
 * That way we can initialize component without useEffect that would complicate code
 */
export class AccessTokenClient {
	/** Axios instance */
	readonly #http: AxiosInstance

	/** Axios instance that is used to refresh access token (prevents infinite loop) */
	readonly #rtHttp: AxiosInstance

	/** Event Emitter */
	readonly #emitter: EventEmitter<{ auth: AuthEventFn }>

	/** SDK state */
	readonly #state: SdkState

	/**
	 *
	 * Constructor
	 * @param options.name Name to be used to store access token in local storage
	 * @param options.accessToken User can provide access token in case it's stored somewhere else
	 * this is useful for SSR and similar cases
	 */
	constructor(options: {
		http: AxiosInstance
		emitter: EventEmitter<{ auth: AuthEventFn }>
		state: SdkState
		rtHttp?: AxiosInstance
	}) {
		this.#http = options.http
		this.#rtHttp = options.rtHttp ?? axios.create()
		this.#emitter = options.emitter
		this.#state = options.state

		// Axios interceptors are LIFO (last in first out, last interceptor will be called first)
		// So this will call to check if AT needs to be updated, and update before injecting AT in request
		this.injectAccessToken()
		this.accessTokenUpdater()
	}

	/**
	 * Change access token
	 *
	 * @param token New token (or null to remove token)
	 */
	setAccessToken(token: string | null): void {
		this.#state.setAccessToken(token)
	}

	/**
	 * Is sdk currently fetching access token
	 */
	private isFetching = false
	/**
	 * Get new access token
	 *
	 * Use different instance so we don't get recursion (intercept interceptor's request)
	 */
	async fetchNewAccessToken(): Promise<void> {
		// prevents multiple concurrent request for same token
		if (this.isFetching) return
		this.isFetching = true
		const response = await this.#rtHttp
			.request<{ accessToken: string }>({
				url: "auth/access-token",
				method: "POST",
				baseURL: this.#http.defaults.baseURL,
				withCredentials: true,
			})
			.catch((e: AxiosError) => {
				// Do not logout user on error, if server is down
				if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
					sdkThrow(e)
				}

				this.#state.setAccessToken(null)
				sdkThrow(e)
			})
			.finally(() => {
				this.isFetching = false
			})

		// TODO Should I throw. If server is offline i don't want to kill session
		const token = response.data.accessToken ?? sdkThrow("978324")
		this.setAccessToken(token)
	}

	/**
	 * Inject access token before each request
	 *
	 * This way we don't have to worry about invalidating old access token
	 * since it will always user access token as current state
	 */
	private injectAccessToken(): void {
		this.#http.interceptors.request.use((config) => {
			if (this.#state.getAccessToken()) {
				const header = `Bearer ${this.#state.getAccessToken()}`
				if (config.headers instanceof AxiosHeaders) {
					config.headers.set("authorization", header)
				} else {
					if (isNil(config.headers)) {
						config.headers = {} as any
					}
					config.headers["authorization"] = header
				}
			}
			return config
		})
	}

	/**
	 * Interceptor that checks every request to see if there is access token that has less than
	 * 20 seconds TTL. If it does, fetch new access token to be used
	 */
	private accessTokenUpdater(): void {
		this.#http.interceptors.request.use(async (config) => {
			if (!this.#state.currentUser?.exp) return config

			const expiresAt = new Date(secondsToMilliseconds(this.#state.currentUser.exp))

			// if current expiration times without 20 seconds is still in the future, don't do anything
			if (isFuture(subSeconds(expiresAt, 20))) return config

			// prevents multiple concurrent request for same token
			// if it's fetching, we don't want to return config, since it will make request with stale
			// data. This will wait up to 5s to finish fetching
			let i = 0
			// if it's fetching, we want to wait until fetching is done
			while (this.isFetching) {
				await sleep(500)
				i++
				if (i > 10) break
				return config
			}

			await this.fetchNewAccessToken()
			this.#emitter.emit("auth", "refresh")

			return config
		})
	}
}
