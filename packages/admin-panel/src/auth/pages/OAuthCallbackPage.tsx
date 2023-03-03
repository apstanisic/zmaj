import { useRefetchQueries } from "@admin-panel/hooks/use-refetch-queries"
import { sleep } from "@zmaj-js/common"
import { useNotify, useRedirect } from "ra-core"
import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAsync } from "react-use"
import { useSdk } from "../../context/sdk-context"

/**
 * This page does nothing. After user is logged in with OIDC, it has to redirect
 * him/her somewhere, so we add this page, that will simply fetch access token
 * and redirect to home page
 */
export function OAuthCallbackPage(): JSX.Element {
	const sdk = useSdk()
	const redirect = useRedirect()
	const notify = useNotify()
	const refetch = useRefetchQueries()
	const [params] = useSearchParams()

	const fn = useCallback(async () => {
		const message = params.get("message") ?? "Successfully signed in"
		try {
			// This only works for oidc, convert to all
			await sdk.auth.oidcSignIn()
			await refetch()
			redirect("/")
			notify(message, { type: "success" })
		} catch (error) {
			redirect("/login")
			console.error(error)
			notify("Problem signing in", { type: "error" })
		}
	}, [notify, params, redirect, refetch, sdk.auth])

	useAsync(async () => fn(), [fn])

	return <div>Please Wait</div>
}
