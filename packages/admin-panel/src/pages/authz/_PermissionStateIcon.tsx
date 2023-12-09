import { ADMIN_ROLE_ID, Permission, Role } from "@zmaj-js/common"
import { isEmpty } from "radash"
import { MdCheck, MdClose, MdSettingsInputComponent } from "react-icons/md"

export function PermissionStateIcon(props: { permission?: Permission; role?: Role }) {
	const { permission, role } = props

	if (role?.id === ADMIN_ROLE_ID) {
		return <MdCheck color="success" data-testid="CheckIcon" />
	} else if (permission === undefined) {
		return <MdClose />
	} else if (Array.isArray(permission.fields) || !isEmpty(permission.conditions)) {
		return <MdSettingsInputComponent color="info" data-testid="SettingsInputComponentIcon" />
	} else {
		return <MdCheck color="success" data-testid="CheckIcon" />
	}
}
