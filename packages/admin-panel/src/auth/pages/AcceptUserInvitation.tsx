import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { getJwtContent } from "@zmaj-js/common"
import { useSearchParams } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { SignUpForm } from "../forms/SignUpForm"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

/**
 * We don't check if admin is inited since it exposes confidential information
 */
export function AcceptUserInvitation() {
	useHtmlTitle("Accept Invitation")
	useRedirectAuthenticated()
	const [query] = useSearchParams()

	const token = query.get("token")

	const email = getJwtContent(token!)["email"]

	return (
		<AuthPageLayout>
			<h1 className="mt-2 text-xl dark:text-white">Create Account</h1>
			<SignUpForm
				type="invitation"
				defaultData={{ email: email as string }}
				invitationToken={token ?? undefined}
			/>
		</AuthPageLayout>
	)
}
