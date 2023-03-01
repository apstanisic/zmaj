import { AnyMongoAbility } from "@casl/ability"
import { CollectionDef, getSystemPermission, systemPermissions } from "@zmaj-js/common"
import { useRedirect } from "ra-core"
import { isString } from "radash"
import { useEffect, useMemo } from "react"
import { useAuthz } from "../state/authz-state"

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

export function checkSystem<T extends keyof typeof systemPermissions>(
	authz: AnyMongoAbility,
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): boolean {
	const perm = getSystemPermission(resourceKey, actionKey)
	return authz.can(perm.action, perm.resource)
}

export function useIsAllowedSystem<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): boolean {
	const perm = getSystemPermission(resourceKey, actionKey)
	return useIsAllowed(perm.action, perm.resource)
}

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
