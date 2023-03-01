import { sdkThrow } from "@client-sdk/errors/error-utils"
import { SdkState } from "@client-sdk/sdk-state"
import {
	AuthUser,
	AuthUserType,
	ConfirmUserInvitationDto,
	Data,
	getEndpoints,
	PasswordResetDto,
	PublicAuthData,
	SignInDto,
	SignUpDto,
} from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import EventEmitter from "eventemitter3"
import { isString } from "radash"
import { AccessTokenClient } from "./access-token.client"
import { AuthSessionsClient } from "./auth-sessions.client"
import { AuthSettingsClient } from "./auth-settings.client"
import { MfaClient } from "./mfa.client"
import { ProfileClient } from "./profile.client"

const initAdminEp = getEndpoints((e) => e.auth.initAdmin)
const signUpEp = getEndpoints((e) => e.auth.signUp)
const signInEp = getEndpoints((e) => e.auth.signIn)
const magicLinkEp = getEndpoints((e) => e.auth.magicLink)
const invitationEp = getEndpoints((e) => e.auth.invitation)
const mfaEp = getEndpoints((e) => e.auth.mfa)

/**
 * Possible auth event
 */
export type AuthEvent = "init" | "sign-in" | "sign-out" | "refresh"

/**
 * Auth event listener callback
 */
export type AuthEventFn = (event: AuthEvent) => void | Promise<void>

type AuthClientParams = {
	http: AxiosInstance
	state: SdkState
	// emitter: Emitter<{ auth: AuthEventFn }>
	emitter: EventEmitter<{ auth: AuthEventFn }>
}

/**
 * Auth
 * Use localStorage as it's a lot easier to fetch access token sync in React component
 * That way we can initialize component without useEffect that would complicate code
 */
export class AuthClient {
	/** User profile */
	readonly profile: ProfileClient

	/** Auth Sessions */
	readonly authSessions: AuthSessionsClient

	/** Service for managing access token */
	private readonly tokensService: AccessTokenClient

	/** Service for configuring auth */
	public readonly settings: AuthSettingsClient

	/** Multi factor authentication */
	public readonly mfa: MfaClient

	#http: AxiosInstance
	#state: SdkState
	#emitter: EventEmitter<{ auth: AuthEventFn }>
	/**
	 *
	 * Constructor
	 * @param http Axios instance
	 * @param options.name Name to be used to store access token in local storage
	 * @param options.accessToken User can provide access token in case it's stored somewhere else
	 * this is useful for SSR and similar cases
	 */
	constructor(params: AuthClientParams) {
		this.#http = params.http
		this.#state = params.state
		this.#emitter = params.emitter
		this.tokensService = new AccessTokenClient(params)
		this.authSessions = new AuthSessionsClient(params.http)
		this.profile = new ProfileClient(params.http)
		this.settings = new AuthSettingsClient(params.http)
		this.mfa = new MfaClient(params.http)
	}

	/** Is user signed in */
	get isSignedIn(): boolean {
		return this.#state.getAccessToken() !== null
	}

	/** Get current user */
	get currentUser(): AuthUser | undefined {
		console.log("auth cl")
		console.log(this.#state["_currentUser"])

		return this.#state.currentUser
	}

	/** Current access token */
	get accessToken(): string | undefined {
		return this.#state.getAccessToken() ?? undefined
	}

	async getPublicAuthInfo(): Promise<PublicAuthData> {
		return this.#http
			.get<{ data: PublicAuthData }>("/admin-panel-wip/auth")
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Add event listener for when auth state change
	 * @param cb That will be called when auth state is changed
	 * @returns Unsubscribe function
	 *
	 * @example
	 *
	 * ```js
	 * const unsubscribe = sdk.auth.onAuthChange((type) => {
	 *   // Do something
	 * })
	 *
	 * unsubscribe()
	 * ```
	 */
	onAuthChange(cb: AuthEventFn): () => void {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.#emitter.on("auth", cb)
		return () => {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			this.#emitter.removeListener("auth", cb)
		}
	}

	/**
	 * OIDC login
	 *
	 * This just refreshes access token since there is no way to return it from OIDC,
	 * but we want to emit sign-in hook, so this function is mostly a wrapper
	 * This will fetch and set access token with refresh token that was set by OIDC
	 */
	async oidcSignIn(): Promise<void> {
		await this.tokensService.fetchNewAccessToken()
		this.#emitter.emit("auth", "sign-in")
	}

	/** Sign in */
	async signIn(data: SignInDto): Promise<AuthUser> {
		// if user already signed in, sign out
		this.tokensService.setAccessToken(null)

		const token = await this.#http
			.post<{ accessToken: string }>(signInEp.signIn, data)
			.then((r) => r.data.accessToken)
			.catch(sdkThrow)

		if (!isString(token)) sdkThrow("Invalid Sign In Response")

		this.tokensService.setAccessToken(token)
		this.#emitter.emit("auth", "sign-in")

		return this.currentUser ?? sdkThrow("9729533")
	}

	/** Sign out */
	async signOut(): Promise<void> {
		await this.#http
			.delete(signInEp.signOut)
			.catch(sdkThrow)
			// we want to sign out user, even if server throws an error
			.finally(() => {
				this.tokensService.setAccessToken(null)
				this.#emitter.emit("auth", "sign-out")
			})
	}

	/** Sign up. This method does not sign in user */
	async signUp(data: SignUpDto): Promise<AuthUser> {
		return this.#http
			.post<Data<AuthUser>>(signUpEp.signUp, data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Send magic link for user to log in
	 *
	 * @param email to which link will be sent
	 * @returns email address
	 */
	async sendMagicLink(email: string): Promise<string> {
		return this.#http
			.post<{ success: true }>(magicLinkEp.sendLink, { destination: email })
			.then(() => email)
			.catch(sdkThrow)
	}

	// async isAdminInitialized(): Promise<boolean> {
	// 	return this.#http
	// 		.get<{ initialized: boolean }>("auth/initialize-admin/is-initialized")
	// 		.then((r) => r.data.initialized)
	// 		.catch(sdkThrow)
	// }

	async createFirstAdminAccount(data: SignUpDto): Promise<AuthUser> {
		return this.#http
			.post<AuthUserType>(initAdminEp.init, data)
			.then((r) => new AuthUser(r.data))
			.catch(sdkThrow)
	}

	async sendPasswordResetEmail(email: string): Promise<{ email: string }> {
		return this.#http
			.post<{ email: string }>("auth/password-reset/request", { email })
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async changeForgottenPassword(data: PasswordResetDto): Promise<{ email: string }> {
		return this.#http
			.put<{ email: string }>("auth/password-reset/reset", data)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async acceptInvitation(data: ConfirmUserInvitationDto): Promise<boolean> {
		return this.#http
			.put<{ success: boolean }>(invitationEp.confirm, data)
			.then((r) => r.data.success)
			.catch(sdkThrow)
	}

	/**
	 * @internal
	 */
	async isAllowed(action: string, resource: string): Promise<boolean> {
		return this.#http
			.get<{ allowed: boolean }>(`system/authorization/can/${action}/${resource}`)
			.then((r) => r.data.allowed)
			.catch(sdkThrow)
	}
}
