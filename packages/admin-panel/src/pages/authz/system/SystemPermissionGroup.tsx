import { Permission, SystemResourcePermissions } from "@zmaj-js/common"
import { ShowFieldContainer } from "../../../shared/show/ShowFieldContainer"
import { SystemPermissionButton } from "./SystemPermissionButton"

type SystemPermissionGroupProps = {
	permission: SystemResourcePermissions
	allowedPermissions: Permission[]
}

export function SystemPermissionGroup(props: SystemPermissionGroupProps) {
	const { allowedPermissions, permission } = props

	return (
		<ShowFieldContainer label={permission.label ?? permission.resource}>
			{/* <div className="grid grid-cols-3 gap-5"> */}
			<div className="flex flex-wrap gap-5">
				{/* Render every action */}
				{Object.values(permission.actions).map((action, i) => (
					<SystemPermissionButton
						key={i}
						allowedPermissions={allowedPermissions}
						permission={permission}
						action={action.key}
					/>
				))}
			</div>
		</ShowFieldContainer>
	)
}
