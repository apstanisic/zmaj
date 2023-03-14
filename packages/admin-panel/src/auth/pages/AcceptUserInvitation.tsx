import { useHtmlTitle } from "@admin-panel/hooks/use-html-title"
import { useSearchParams } from "react-router-dom"
import { AuthPageLayout } from "../components/AuthPageLayout"
import { SignUpForm } from "../forms/SignUpForm"
import { useRedirectAuthenticated } from "../hooks/use-redirect-authenticated"

/**
 * We don't check if admin is inited since it exposes confidential information
 */
export function AcceptUserInvitation(): JSX.Element {
	useHtmlTitle("Accept Invitation")
	useRedirectAuthenticated()
	const [query] = useSearchParams()

	return (
		<AuthPageLayout>
			<h1 className="mt-2 text-xl dark:text-white">Create Admin Account</h1>
			<SignUpForm
				type="invitation"
				defaultData={{ email: query.get("email") ?? undefined }}
				invitationToken={query.get("token") ?? undefined}
			/>
		</AuthPageLayout>
	)
}
