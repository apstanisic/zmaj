import { AuthPageLayout } from "../components/AuthPageLayout"
import { SignUpForm } from "../forms/SignUpForm"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

/**
 * We don't check if admin is inited since it exposes confidential information
 */
export function AdminInitPage(): JSX.Element {
	// const inited = usePublicInfo().data?.adminInitialized ?? false //useIsAdminInited().data

	useRedirectAuthenticated()
	// const redirect = useRedirect()

	// redirect to login page only if we know that admin is inited
	// useEffect(() => {
	// 	// hook will redirect if signed in
	// 	if (signedIn) return
	// 	// if (inited) return redirect("/login")
	// }, [redirect, inited, signedIn])

	return (
		<AuthPageLayout>
			<h1 className="mt-2 text-xl dark:text-white">Create Admin Account</h1>
			<SignUpForm type="init-admin" />
		</AuthPageLayout>
	)
}
