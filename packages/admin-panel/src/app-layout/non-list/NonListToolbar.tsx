import { useLayoutConfigContext } from "@admin-panel/context/layout-config-context"
import { useAuthz } from "@admin-panel/state/authz-state"
import { clsx } from "clsx"
import { RaRecord, useResourceDefinition } from "ra-core"
import { memo, ReactNode, useCallback, useMemo } from "react"
import { useActionContext } from "../../context/action-context"
import { useCollectionContext } from "../../context/collection-context"
import { useSuccessRedirect } from "../../hooks/use-success-redirect"
import { throwInApp } from "../../shared/throwInApp"
import { DeleteButton } from "../buttons/DeleteButton"
import { EditButton } from "../buttons/EditButton"
import { ShowButton } from "../buttons/ShowButton"
import { CrudBreadcrumbs } from "../CrudBreadcrumbs"
import { ShowChangesButton } from "../show/ShowChangesButton"
// import { ShowChangesButton } from "../show/ShowChangesButton"
import { ShowRecordAsJsonDialog } from "../show/ShowRecordAsJsonDialog"
import { useTitle } from "./useNonListTitle"

export type NonListToolbarProps = {
	title?: string
	startButtons?: ReactNode
	endButtons?: ReactNode
	onDelete?: (data: RaRecord) => Promise<void> | void
	disableDeleteRedirect?: boolean
}

/**
 * Toolbar has same design for show/edit/create, so we are only displaying different fields
 * depending on action
 * Not displayed on list
 */
export const NonListToolbar = memo((props: NonListToolbarProps) => {
	const resourceInfo = useResourceDefinition()
	const action = useActionContext()

	const title = useTitle()
	const collection = useCollectionContext() ?? throwInApp("42351")

	const successRedirect = useSuccessRedirect()
	const authz = useAuthz()

	const config = useLayoutConfigContext()
	// const redirect = useRedirect()

	const hasDelete = useMemo(
		() =>
			(action === "edit" || action === "show") &&
			config.hideDeleteButton !== true &&
			authz.can("delete", collection.authzKey),
		[action, authz, collection.authzKey, config.hideDeleteButton],
	)

	const onDeleteSuccess = useCallback(
		async (data: RaRecord) => {
			if (props.disableDeleteRedirect !== true) successRedirect(data, "delete")
			await props.onDelete?.(data)
		},
		[props, successRedirect],
	)

	return (
		<>
			<CrudBreadcrumbs />
			<div className="mt-4 mb-6 flex items-center justify-between">
				<h1 className="max-w-[70%] text-lg md:text-xl">{props.title ?? title}</h1>
				{/* Reduce gap on small screens, and limit width  */}
				{/* <div className={clsx("grid grid-cols-3 gap-1", "md:flex md:gap-2")}> */}
				<div className={clsx("flex flex-wrap gap-2")}>
					{props.startButtons}
					{/* Add your custom actions */}
					{/* No need for list button since we have breadcrumbs */}
					{/* {resourceInfo.hasList && <ListButton />} */}
					{resourceInfo.hasShow && action === "edit" && <ShowButton />}
					{resourceInfo.hasEdit && action === "show" && <EditButton />}

					{config.hideDisplayAsJsonButton !== true && <ShowRecordAsJsonDialog />}
					<ShowChangesButton />
					{hasDelete && <DeleteButton onSuccess={onDeleteSuccess} />}

					{/* {hasDelete && (
						<DeleteButton
							mutationMode="pessimistic"
							mutationOptions={{
								onSuccess: onDeleteSuccess,
							}}
						/>
					)} */}
					{props.endButtons}
				</div>
			</div>
		</>
	)
})
