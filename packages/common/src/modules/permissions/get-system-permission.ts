import { systemPermissions, SystemResourcePermissions } from "./system-permissions.consts"

export function getSystemPermission<T extends keyof typeof systemPermissions>(
	resourceKey: T,
	actionKey: keyof typeof systemPermissions[T]["actions"],
): { action: string; resource: string } {
	// TODO Remove to any when all tooling supports satisfies (tsup)
	const base: SystemResourcePermissions = systemPermissions[resourceKey] as any
	const resource = base.resource
	const action = base.actions[actionKey as any]!.key
	return { action, resource }
}
