import { useAuthState } from "ra-core"
import { useEffect } from "react"

/**
 * Hook that calls provided function every time auth status changes
 *
 * @param onAuthChange Callback that will be called every time auth status changes
 */
// export function useOnAuthChange(onAuthChange: (event: AuthEvent) => unknown): void {
// 	const sdk = useSdk()
// 	const listener = useRef<(() => void) | null>(null)

// 	useEffect(() => {
// 		if (!listener.current) {
// 			listener.current = sdk.auth.onAuthChange((event) => {
// 				onAuthChange(event)
// 			})
// 		}
// 		// remove listener on unmount
// 		return () => {
// 			listener.current?.()
// 			listener.current = null
// 		}
// 	}, [onAuthChange, sdk.auth])
// }

export function useOnAuthChange(fn: () => void | Promise<void>): void {
	const { isLoading, authenticated } = useAuthState()

	// const sdk = useSdk()
	// console.log(sdk.auth.currentUser?.userId)

	useEffect(() => {
		console.log("Called onAuthChange")

		// if (isLoading) return
		// // we do not wait for end of function in case it async
		// void fn()
	}, [authenticated, fn, isLoading])
}
