import { useIsAllowedSystem } from "@admin-panel/hooks/use-is-allowed"
import { useRecord } from "@admin-panel/hooks/use-record"
import { ADMIN_ROLE_ID, isNil, Permission, Role } from "@zmaj-js/common"
import { useListController } from "ra-core"
import { memo } from "react"
import { TabsLayout } from "../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../crud-layouts/ui/tabs/TabsSection"
import { GeneratedShowPage } from "../../generator/pages/GeneratedShowPage"
import { RoleUsers } from "./_RoleUsers"
import { PermissionsTable } from "./collections/_PermissionsTable"
import { PermissionDialog } from "./dialog/_PermissionDialog"
import { SystemPermissionsTab } from "./system/_SystemPermissionsTab"

/**
 * TODO Add ability for plugins to inject permissions
 */
export const RoleShow = memo(() => {
	return (
		<GeneratedShowPage>
			<Content />
		</GeneratedShowPage>
	)
})

function Content() {
	const role = useRecord<Role>()

	const permissions = useListController<Permission>({
		resource: "zmaj_permissions",
		disableSyncWithLocation: true,
		filter: { roleId: role?.id },
		sort: { field: "resource" as keyof Permission, order: "ASC" },
		queryOptions: {
			enabled: !isNil(role?.id) && role?.id !== ADMIN_ROLE_ID,
			meta: { getAll: true },
		},
	})

	const readUsers = useIsAllowedSystem("users", "read")
	let sections = ["Collections", "System", "Users"]
	if (!readUsers) {
		sections = sections.slice(0, 2)
	}

	return (
		<>
			<PermissionDialog permissions={permissions.data ?? []} refetch={permissions.refetch} />
			<div className="flex justify-between">
				<p className="text-lg">{role?.description}</p>
				<p className="text-lg text-warning-content">
					MFA {role?.requireMfa ? "required" : "not required"}
				</p>
			</div>
			{/* {role?.requireMfa ? <></> : <></>} */}
			<TabsLayout sections={sections}>
				<TabsSection>
					<PermissionsTable allowedPermissions={permissions.data ?? []} />
				</TabsSection>
				<SystemPermissionsTab allowedPermissions={permissions.data ?? []} />

				{readUsers && <RoleUsers />}
			</TabsLayout>
		</>
	)
}
