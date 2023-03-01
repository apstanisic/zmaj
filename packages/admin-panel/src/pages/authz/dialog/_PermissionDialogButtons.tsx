import { Button } from "@admin-panel/ui/Button"
import { Permission } from "@zmaj-js/common"
import { useDelete, useNotify } from "ra-core"
import { useAuthzDialogState } from "./authz-dialog-state"

type PermissionDialogButtonProps = {
	permission?: Permission
	refreshPermissions: () => unknown
}

export function PermissionDialogButtons(props: PermissionDialogButtonProps): JSX.Element {
	const { permission } = props
	const [deleteOne] = useDelete()
	const notify = useNotify()
	const { hideDialog } = useAuthzDialogState()

	return (
		<div className="flex justify-between">
			<Button outline onClick={hideDialog}>
				Cancel
			</Button>

			<div>
				{permission && (
					<Button
						variant="warning"
						className="ml-auto"
						onClick={() => {
							deleteOne("zmaj_permissions", {
								id: permission.id,
								previousData: permission,
							})
								.then((r) => {
									hideDialog()
									notify("Successfully removed permission", { type: "success" })
									props.refreshPermissions()
								})
								.catch((r) => notify("Problem removing permission", { type: "error" }))
						}}
					>
						Forbid
					</Button>
				)}
				<Button type="submit" variant="secondary" className="ml-5">
					{permission?.id ? "Change" : "Enable"}
				</Button>
			</div>
		</div>
	)
}
