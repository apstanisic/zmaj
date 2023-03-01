import { useRedirect } from "ra-core"
import { useEffect } from "react"
import { useSdk } from "../../context/sdk-context"

/**
 * Redirect user if user is authenticated
 */
export function useRedirectAuthenticated(to: string = "/"): boolean {
	const redirect = useRedirect()
	const sdk = useSdk()

	useEffect(() => {
		if (sdk.auth.isSignedIn) redirect(to)
	}, [redirect, sdk.auth.isSignedIn, to])

	return sdk.auth.isSignedIn
}
