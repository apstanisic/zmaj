import { AnyFn } from "@zmaj-js/common"
import { useAuthProvider } from "ra-core"
import { useCallback } from "react"

export function useOnLogout(): (key: string, fn: AnyFn) => (() => any) | undefined {
	const authProvider = useAuthProvider()

	const setFn = useCallback(
		(key: string, fn: AnyFn) => {
			const onLogout = authProvider["onLogout"]
			if (onLogout === undefined) return
			const cleanUp = onLogout(key, fn)
			return () => cleanUp()
		},
		[authProvider],
	)
	//   useEffect(() => {
	//     if (fn === undefined) return
	//     const onLogout = authProvider.onLogout
	//     if (onLogout === undefined) return console.log("test")
	//     if (!isFunction(onLogout)) throwInApp()
	//     const cleanUp = onLogout(fn)
	//     return () => cleanUp()
	//   }, [authProvider, fn, key])

	return setFn
}
