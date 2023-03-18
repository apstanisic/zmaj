import { useGlobalConfigContext } from "@admin-panel/context/global-config-context"
import { CustomRoutes } from "ra-core"
import { Route } from "react-router"
import { UserProfileEdit } from "../profile/EditUserProfilePage"
import { Enable2FA } from "../profile/Enable2FA"
import { UserProfilePage } from "../profile/UserProfilePage"
import { AcceptUserInvitation } from "./AcceptUserInvitation"
import { AdminInitPage } from "./AdminInitPage"
import { OAuthCallbackPage } from "./OAuthCallbackPage"
import { RequestPasswordResetPage } from "./RequestPasswordResetPage"
import { SetForgottenPasswordPage } from "./SetForgottenPasswordPage"
import { SignInPage } from "./SignInPage"
import { SignUpPage } from "./SignUpPage"

/**
 * Run this component as a function, not as a component
 * Currently RA requires direct children to be `CustomRouter` since it inspects children for routes
 * We don't want to import all auth pages in AdminUI page
 * ```js
 * // invalid
 * <AdminUI>
 *   <AuthPages />
 * </AdminUI>
 *
 * // ugly and wrong, but works
 * const pages = useMemo(() => <>{AuthPages()}</>, [])
 *
 * <AdminUI>
 *   {pages}
 * </AdminUI>
 * ```
 *
 * @returns Custom routes
 */
export function authPages(): JSX.Element {
	return (
		<>
			<CustomRoutes noLayout>
				<Route element={<SignInPage />} path="/sign-in" />
				<Route element={<SignUpPage />} path="/sign-up" />
				<Route element={<OAuthCallbackPage />} path="/auth/success-redirect" />
				<Route element={<AdminInitPage />} path="/auth/init" />
				<Route element={<RequestPasswordResetPage />} path="/auth/forgotten-password" />
				<Route element={<SetForgottenPasswordPage />} path="/auth/password-reset" />
				<Route element={<AcceptUserInvitation />} path="/auth/invite" />
			</CustomRoutes>
			<CustomRoutes>
				<Route element={<UserProfilePage />} path="/profile" />
				<Route element={<UserProfileEdit />} path="/profile/edit" />
				<Route element={<Enable2FA />} path="/profile/2fa" />
			</CustomRoutes>
		</>
	)
}
