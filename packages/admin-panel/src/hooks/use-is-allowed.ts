import { AnyMongoAbility } from "@casl/ability"
import { CollectionDef, getSystemPermission, systemPermissions } from "@zmaj-js/common"
import { useRedirect } from "ra-core"
import { isString } from "radash"
import { useEffect, useMemo } from "react"
import { useAuthz } from "../state/authz-state"

/**
 * Check if action is allowed
 * @example
 * ```js
 * useIsAllowed('update', 'posts', 'title')
 * useIsAllowed('delete', 'comments')
 * ```
 */
export function useIsAllowed(
	action: string,
	collection: CollectionDef | string,
	field?: string,
): boolean {
	const resource = isString(collection) ? collection : collection.authzKey
	const authz = useAuthz()

	return useMemo(
		() => authz.can(action, resource, field), //
		[action, authz, field, resource],
	)
}

/**
 * Check system permission. Used as a function, so it can be used when initializing
 * in resource functions
 */
export function checkSystem<T extends keyof typeof systemPermissions>(
	authz: AnyMongoAbility,
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): boolean {
	const perm = getSystemPermission(resourceKey, actionKey)
	return authz.can(perm.action, perm.resource)
}

/**
 * Check if system action is allowed
 * This is same as `useIsAllowed`, but this hook provides types for system permissions
 */
export function useIsAllowedSystem<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): boolean {
	const perm = getSystemPermission(resourceKey, actionKey)
	return useIsAllowed(perm.action, perm.resource)
}

/**
 * This hook will check if action is allowed, and redirect to home page if not
 */
export function useRedirectForbidden<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): boolean {
	const redirect = useRedirect()
	const perm = getSystemPermission(resourceKey, actionKey)
	const allowed = useIsAllowed(perm.action, perm.resource)
	useEffect(() => {
		if (!allowed) redirect("/")
	}, [allowed, redirect])

	return allowed
}
