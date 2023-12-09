import { Permission, systemPermissions } from "@zmaj-js/common"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { SystemPermissionGroup } from "./SystemPermissionGroup"

type SystemPermissionsTabProps = {
	allowedPermissions: Permission[]
}

export function SystemPermissionsTab(props: SystemPermissionsTabProps) {
	const { allowedPermissions } = props
	return (
		<TabsSection>
			{Object.values(systemPermissions).map((permission, i) => (
				<SystemPermissionGroup
					key={i}
					permission={permission}
					allowedPermissions={allowedPermissions}
				/>
			))}
		</TabsSection>
	)
}
