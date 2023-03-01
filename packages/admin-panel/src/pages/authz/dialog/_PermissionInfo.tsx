import { List } from "@admin-panel/ui/List"
import { IdRecord, Permission, Role } from "@zmaj-js/common"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { useAuthzDialogState } from "./authz-dialog-state"

/**
 * We are permission prop that represents `zmaj_permission`. It will exist only if we are
 * changing permission, not on create. In create case, we will fill it with data from dialog permission
 * and from role
 */
export function PermissionInfo(props: {
	permission?: Permission
	role?: IdRecord<Role>
}): JSX.Element {
	const { permission, role } = props
	const dialogPermission = useAuthzDialogState().permission

	if (!dialogPermission) return <></>

	return (
		<TabsSection>
			<List className="h-[400px]">
				{permission?.id && (
					<List.Item>
						<List.TitleAndSub title={permission?.id} subtitle="Permission Id" />
					</List.Item>
				)}

				<List.Item>
					<List.TitleAndSub title={dialogPermission.action} subtitle="action" />
				</List.Item>

				<List.Item>
					<List.TitleAndSub title={dialogPermission.resource} subtitle="resource" />
				</List.Item>

				<List.Item>
					<List.TitleAndSub title={role?.name ?? role?.id ?? "Unknown Role"} subtitle="role" />
				</List.Item>
			</List>
		</TabsSection>
	)
}
