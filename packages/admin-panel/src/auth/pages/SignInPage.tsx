import { memo } from "react"
import { Link } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { MagicLinkDialog } from "../components/MagicLinkDialog"
import { OidcProviders } from "../components/OidcProviders"
import { SignInForm } from "../forms/SignInForm"
import { usePublicInfo } from "../hooks/use-public-info"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

export function SignInPage(): JSX.Element {
	const signedIn = useRedirectAuthenticated()
	if (signedIn) return <></>

	return (
		<AuthPageLayout>
			<h1 className="mt-2 text-xl dark:text-white">Sign In</h1>
			<SignInForm />

			<ResetPasswordLink />
			<MagicLinkDialog />
			<OidcProviders />
		</AuthPageLayout>
	)
}

const ResetPasswordLink = memo(() => {
	const info = usePublicInfo()

	if (info.data?.resetPasswordAllowed !== true) return <></>
	return (
		<Link className="du-link mt-8 ml-auto" to="/auth/forgotten-password">
			Forgot password? Click here
		</Link>
	)
})
