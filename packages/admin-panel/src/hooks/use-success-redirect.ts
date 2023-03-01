import { RaRecord, useNotify, useRedirect, useResourceDefinition } from "ra-core"
import { useMemo } from "react"

/**
 * Redirect to resource page on success
 *
 * Used for handling successful request (update/create/delete)
 * It's based on original RA implementation, but it gives us bigger control
 *
 * Main changes:
 * - Redirects to show by default
 * - Redirects to home page if no action available
 * - Shows success notification instead of info
 */
export function useSuccessRedirect(): (
	data: RaRecord,
	action: "edit" | "create" | "delete",
) => void {
	const resource = useResourceDefinition()
	const redirect = useRedirect()
	const notify = useNotify()

	const where = useMemo(
		() => (resource.hasShow ? "show" : resource.hasEdit ? "edit" : resource.hasList ? "list" : "/"),
		[resource],
	)
	return (data, action) => {
		const doneAction = action === "create" ? "created" : action === "delete" ? "deleted" : "updated"

		notify(`ra.notification.${doneAction}`, {
			type: "success",
			messageArgs: { smart_count: 1 },
		})

		if (where === "/") {
			redirect("/")
		} else if (action === "delete" && resource.hasList) {
			redirect("list", resource.name)
		} else if (action === "delete") {
			redirect("/")
		} else {
			redirect(where, resource.name, data.id)
		}
	}
}
