import { ZmajSdk } from "@zmaj-js/client-sdk"
import { isNil, SignInDto, systemPermissions } from "@zmaj-js/common"
import { AuthProvider, UserIdentity } from "ra-core"
import { isEmpty } from "radash"
import { EmptyObject } from "type-fest"
import { z } from "zod"
import { throwInApp } from "../shared/throwInApp"

const CanParams = z.object({ action: z.string().min(1), resource: z.string().min(1) })

type OnEvent = {
	login?: () => Promise<void>
	logout?: () => Promise<void>
}

export function initAuthProvider(sdk: ZmajSdk, events: OnEvent = {}): AuthProvider {
	return {
		/**
		 * Try login
		 * @returns `undefined` if login successful
		 * @throws if login unsuccessful
		 */
		async login(
			params: { email: string; password: string; otpToken?: string | null } | EmptyObject,
		) {
			// if (params !== undefined) throw new Error("754182348")
			// const { otpToken, password, email } = params
			// if (isNil(email)) throw new Error("No email")

			if (!isEmpty(params)) {
				const res = await sdk.auth.signIn(params as SignInDto)
				if (res.status !== "success") throw new Error("MFA misconfigured")
			}

			const { actions, resource } = systemPermissions.adminPanel
			const allowed = await sdk.auth.isAllowed(actions.access.key, resource)
			if (!allowed) {
				await sdk.auth.signOut()
				alert("You are not allowed to access admin panel")
				throwInApp("Forbidden")
			}

			await events.login?.()
		},

		/**
		 * Logout
		 * @returns url where to redirect
		 * @throws If logout didn't work
		 */
		async logout(): Promise<string | false | void> {
			if (sdk.state.currentUser) {
				await sdk.auth.signOut().catch((e) => {})
			}
			await events.logout?.()
			return "/login"
		},

		/**
		 * Check if user is logged in and if can access page. If rejected, it will logout user
		 *
		 * We check if page is one of whitelisted, because we want to allow them to access them
		 * @returns `undefined` if user is logged in
		 * @throws if user is not logged in
		 */
		async checkAuth(params: any): Promise<void> {
			if (sdk.auth.isSignedIn) return Promise.resolve()

			const url = new URL(window.location.href)
			const allowAnon = [
				"#/sign-in",
				"#/sign-up",
				"#/auth/success/redirect",
				"#/auth/init",
				"#/auth/forgotten-password",
				"#/auth/password-reset",
				"#/auth/invite",
			]

			if (
				allowAnon.includes(url.hash) ||
				allowAnon.some((allowed) => url.hash.startsWith(`${allowed}?`))
			) {
				return Promise.resolve()
			}

			return Promise.reject()
		},

		/**
		 * Should we logout user. We never want to logout user based on the server response
		 */
		async checkError(error: unknown): Promise<void> {
			// if (!(error instanceof HttpError)) return Promise.resolve()

			// error.axiosError.
			// if (error.axiosError.response?.status === 401) throw new AdminPanelError("#24107123")
			return Promise.resolve()
		},

		async getPermissions(): Promise<{ fields?: string[] }> {
			return Promise.resolve({})
		},

		/**
		 * Get user info
		 *
		 * @returns Object with user's id and email
		 * @throws If problem getting info
		 */
		async getIdentity(): Promise<UserIdentity> {
			const user = sdk.auth.currentUser ?? throwInApp("#96412")

			return { id: user.userId, fullName: user.email, user: user }
		},
	}
}
