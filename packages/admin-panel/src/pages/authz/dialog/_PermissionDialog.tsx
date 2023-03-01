import { useRecord } from "@admin-panel/hooks/use-record"
import { Dialog } from "@admin-panel/ui/Dialog"
import { Permission, Role } from "@zmaj-js/common"
import { Form, RecordContextProvider, useCreate, useNotify, useUpdate } from "ra-core"
import { memo, useCallback, useMemo } from "react"
import { TabsLayout } from "../../../crud-layouts/ui/tabs/TabsLayout"
import { TabsSection } from "../../../crud-layouts/ui/tabs/TabsSection"
import { DialogPermission } from "../dialog-permission.type"
import { useAuthzDialogState } from "./authz-dialog-state"
import { PermissionConditionsInput } from "./_PermissionConditionsInput"
import { PermissionDialogButtons } from "./_PermissionDialogButtons"
import { PermissionFieldsInput } from "./_PermissionFieldsInput"
import { PermissionInfo } from "./_PermissionInfo"

export const PermissionDialog = memo(
	(props: { permissions: Permission[]; refetch: () => unknown }) => {
		const { permissions, refetch } = props
		const authzDialog = useAuthzDialogState()
		const dialogPermission = authzDialog.permission
		// const setDialogPermission = authzDialog.showDialog
		const role = useRecord<Role>()
		const [updateOne] = useUpdate()
		const [createOne] = useCreate()
		const notify = useNotify()

		const existingPermission = useMemo(
			() =>
				structuredClone(
					permissions.find(
						(p) =>
							p.action === dialogPermission?.action && p.resource === dialogPermission.resource,
					),
				),
			[permissions, dialogPermission],
		)

		const onForbid = useCallback(() => {
			refetch()
		}, [refetch])

		const onSubmit = useCallback(
			(permission: Partial<Permission | DialogPermission>) => {
				let crudPromise: Promise<unknown>
				// if permission has id, it's updating
				if ("id" in permission) {
					crudPromise = updateOne("zmaj_permissions", {
						data: permission,
						id: permission.id,
						previousData: existingPermission,
					})
				} else {
					crudPromise = createOne(
						"zmaj_permissions",
						{ data: permission },
						{ returnPromise: true },
					) as Promise<unknown>
				}

				crudPromise
					.then((r) => authzDialog.hideDialog())
					.then((r) => notify("Permissions successfully updated", { type: "success" }))
					.then((r) => refetch())
					.catch((e) => notify("Problem changing permission", { type: "error" }))
			},
			[authzDialog, createOne, existingPermission, notify, refetch, updateOne],
		)

		return (
			<>
				<Dialog
					// fullWidth
					className="max-w-3xl"
					open={dialogPermission !== undefined}
					onClose={() => authzDialog.hideDialog()}
				>
					{/* Need to check here also for TS */}
					{dialogPermission && (
						// Form uses `useRecordContext` to read current values
						// so we create empty context. This way Form won't take role data from parent context
						<RecordContextProvider value={{}}>
							<Form
								defaultValues={
									existingPermission ?? {
										fields: dialogPermission.fields,
										conditions: {},
										action: dialogPermission.action,
										resource: dialogPermission.resource,
										roleId: role?.id,
									}
								}
								onSubmit={onSubmit}
								className="flex h-[700px] flex-col justify-between p-8"
							>
								<TabsLayout
									sections={
										dialogPermission.availableFields === null
											? ["Basic", "Conditions"]
											: ["Basic", "Fields", "Conditions"]
									}
								>
									{/* Tab 1 */}
									<PermissionInfo permission={existingPermission} role={role} />

									{/* Tab 2 */}
									{dialogPermission.availableFields !== null && (
										<TabsSection>
											<PermissionFieldsInput fields={dialogPermission.availableFields} />
										</TabsSection>
									)}
									{/* Tab 3 */}
									<PermissionConditionsInput />
								</TabsLayout>
								<PermissionDialogButtons
									refreshPermissions={onForbid}
									permission={existingPermission}
								/>
							</Form>
						</RecordContextProvider>
					)}
				</Dialog>
			</>
		)
	},
)
