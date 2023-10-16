import { isNil } from "@zmaj-js/common"
import { Context, createContext, PropsWithChildren, useContext } from "react"
import { AdminPanelError } from "../shared/AdminPanelError"
type GenerateContextValue<T> = [
	provider: (props: PropsWithChildren<{ value: T }>) => JSX.Element,
	hook: () => T,
	context: Context<T>,
]

/**
 * Remove boilerplate around defining context
 * Only call once for every context
 * ```js
 * export [UserProvider, useUser, userCtx] = generateContext<User>(new User())
 * export [UserProvider2, useUser2, userCtx2] = generateContext<User>(undefined, {throwOnNil: true})
 * ```
 *
 * Different function signature are for bigger flexibility, since in most cases we don't have
 * value when defining context, we can either set as `| undefined` or use `(undefined as never)`
 * This provides option to not provide default value, but will throw if we try to access it
 * and value is undefined. It's type safe, since it will throw error.
 */
export function generateContext<T>(
	defaultValue: T | undefined,
	options: { throwOnNil: true },
): GenerateContextValue<T>
export function generateContext<T>(
	defaultValue: T,
	options?: { throwOnNil?: false },
): GenerateContextValue<T>
export function generateContext<T>(
	defaultValue: T,
	options?: { throwOnNil?: boolean },
): GenerateContextValue<T> {
	const Ctx = createContext<T>(defaultValue)

	function useCtx(): T {
		const val = useContext(Ctx)
		if (options?.throwOnNil && isNil(val)) throw new AdminPanelError("153212")
		return val
	}

	function ProvideCtx(props: PropsWithChildren<{ value: T }>): JSX.Element {
		return <Ctx.Provider value={props.value}>{props.children}</Ctx.Provider>
	}

	return [ProvideCtx, useCtx, Ctx]
}
