import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useNotify, useRedirect } from "ra-core"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { SignUpForm } from "../forms/SignUpForm"
import { usePublicInfo } from "../hooks/use-public-info"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

/**
 * We can use same form for create admin and create normal account since it's same data
 */
export function SignUpPage(): JSX.Element {
	useHtmlTitle("Sign Up")
	const authInfo = usePublicInfo().data
	const signUpAllowed = authInfo?.signUpAllowed ?? true
	const notify = useNotify()
	const redirect = useRedirect()
	const signedIn = useRedirectAuthenticated()

	useEffect(() => {
		if (signUpAllowed) return

		notify("Sign up is not allowed", { type: "error" })
		redirect("/login")
	}, [signUpAllowed, notify, redirect])

	if (signedIn) return <></>

	return (
		<AuthPageLayout>
			<h1 className="mt-2 text-xl dark:text-white">Sign Up</h1>
			<SignUpForm type="sign-up" />

			<div className="mt-5">
				<span className="dark:text-white">Already have an account?</span>
				<Link to="/login" className="ml-2 font-semibold text-blue-700">
					Sign In
				</Link>
			</div>
		</AuthPageLayout>
	)
}
