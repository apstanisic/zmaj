import { createStore, StateCreator, StoreApi, useStore } from "zustand"
import { persist } from "zustand/middleware"

export function createState<T>(
	defaultValue: T,
	persistKey?: string,
): StoreApi<{
	value: T
	set: (val: T) => void
}> {
	const fn: StateCreator<{ value: T; set: (val: T) => void }, any> = (set) => ({
		value: defaultValue,
		set: (value: T) => set({ value }),
	})
	if (persistKey === undefined) {
		return createStore(fn)
	} else {
		return createStore(persist(fn, { name: "STATE:" + persistKey }))
	}
}

export function useStateAsTuple<T>(
	state: StoreApi<{ value: T; set: (v: T) => void }>,
): readonly [T, (v: T) => void] {
	return useStore(state, (s) => [s.value, s.set] as const)
}

export function stateFactory<T>(
	defaultValue: T,
	persistKey?: string,
): [
	() => readonly [T, (v: T) => void], //
	StoreApi<{ value: T; set: (val: T) => void }>,
] {
	const state = createState(defaultValue, persistKey)
	return [() => useStateAsTuple(state), state]
}

/**
 * To many types of state
 * 3. react-query: useServerValue. Used with simple helpers, can only be used with server state
 * 4. zustand: createStore
 */
